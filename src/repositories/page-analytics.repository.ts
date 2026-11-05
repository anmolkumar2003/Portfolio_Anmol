import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  AnalyticsFailureCode,
  AnalyticsMetric,
  PageAnalyticsTotals,
} from '@models';
import { getSupabaseBrowserClient, isSupabaseConfigured } from './supabase.client';
import { getOrCreateVisitorKey } from './telemetry.ids';

const PRESENCE_CHANNEL = 'telemetry-room';
const ANALYTICS_ROW_ID = 1;
const PUBLIC_STATS_PATH = '/api/telemetry/public-stats';

export interface PresenceTrackPayload {
  readonly visitorKey: string;
  readonly browserName: string;
  readonly operatingSystem: string;
  readonly joinedAt: string;
}

export interface AnalyticsResult<T> {
  readonly data: T | null;
  readonly errorCode: AnalyticsFailureCode | null;
  readonly errorMessage: string | null;
}

export interface PublicLiveStats {
  readonly totalViews: number;
  readonly totalDownloads: number;
  readonly activeNow: number;
}

function emptyTotals(): PageAnalyticsTotals {
  return { totalViews: 0, totalDownloads: 0 };
}

function mapTotals(row: object): PageAnalyticsTotals {
  const record = row as Record<string, unknown>;
  return {
    totalViews: Number(record.total_views ?? 0) || 0,
    totalDownloads: Number(record.total_downloads ?? 0) || 0,
  };
}

function classifyPostgrestError(
  message: string | undefined,
  code?: string,
): AnalyticsFailureCode {
  const text = `${code ?? ''} ${message ?? ''}`.toLowerCase();

  if (
    text.includes('could not find the table') ||
    text.includes('schema cache') ||
    text.includes('does not exist') ||
    text.includes('42p01')
  ) {
    return 'analytics_table_missing';
  }

  if (
    text.includes('failed to fetch') ||
    text.includes('network') ||
    text.includes('fetch')
  ) {
    return 'supabase_unreachable';
  }

  return 'rpc_failed';
}

function configuredHost(): string | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (!url) {
    return null;
  }

  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export interface IPageAnalyticsRepository {
  isConfigured(): boolean;
  getConfiguredHost(): string | null;
  fetchTotals(): Promise<AnalyticsResult<PageAnalyticsTotals>>;
  increment(metric: AnalyticsMetric): Promise<AnalyticsResult<PageAnalyticsTotals>>;
  fetchPublicStats(): Promise<AnalyticsResult<PublicLiveStats>>;
  subscribeTotals(
    onChange: (totals: PageAnalyticsTotals) => void,
  ): () => void;
  joinPresence(
    payload: Omit<PresenceTrackPayload, 'visitorKey'> & {
      visitorKey?: string;
    },
    onOnlineCount: (count: number | null, errorCode?: AnalyticsFailureCode) => void,
  ): () => void;
}

let viewsIncrementLock: Promise<AnalyticsResult<PageAnalyticsTotals>> | null =
  null;

export class PageAnalyticsRepository implements IPageAnalyticsRepository {
  public isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  public getConfiguredHost(): string | null {
    return configuredHost();
  }

  public async fetchTotals(): Promise<AnalyticsResult<PageAnalyticsTotals>> {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return {
        data: null,
        errorCode: 'supabase_not_configured',
        errorMessage: 'Supabase env vars are missing.',
      };
    }

    try {
      const { data, error } = await client
        .from('page_analytics')
        .select('total_views, total_downloads')
        .eq('id', ANALYTICS_ROW_ID)
        .maybeSingle();

      if (error) {
        return {
          data: null,
          errorCode: classifyPostgrestError(error.message, error.code),
          errorMessage: error.message,
        };
      }

      if (!data) {
        return {
          data: null,
          errorCode: 'analytics_table_missing',
          errorMessage: 'page_analytics row id=1 was not found.',
        };
      }

      return { data: mapTotals(data), errorCode: null, errorMessage: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        data: null,
        errorCode: 'supabase_unreachable',
        errorMessage: message,
      };
    }
  }

  public async increment(
    metric: AnalyticsMetric,
  ): Promise<AnalyticsResult<PageAnalyticsTotals>> {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return {
        data: null,
        errorCode: 'supabase_not_configured',
        errorMessage: 'Supabase env vars are missing.',
      };
    }

    const run = async (): Promise<AnalyticsResult<PageAnalyticsTotals>> => {
      try {
        const response = await client.rpc('increment_counter', {
          metric,
        });

        if (response.error) {
          return {
            data: null,
            errorCode: classifyPostgrestError(
              response.error.message,
              response.error.code,
            ),
            errorMessage: response.error.message,
          };
        }

        const raw: unknown = response.data;
        const row: unknown = Array.isArray(raw) ? raw[0] : raw;
        if (row && typeof row === 'object') {
          return {
            data: mapTotals(row),
            errorCode: null,
            errorMessage: null,
          };
        }

        // PostgREST may return 204/empty body while still applying the update.
        const refetched = await this.fetchTotals();
        if (refetched.data) {
          return refetched;
        }

        return {
          data: null,
          errorCode: 'rpc_failed',
          errorMessage:
            refetched.errorMessage ??
            'increment_counter returned no payload and refetch failed.',
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
          data: null,
          errorCode: 'supabase_unreachable',
          errorMessage: message,
        };
      }
    };

    if (metric === 'views') {
      if (!viewsIncrementLock) {
        viewsIncrementLock = run();
      }
      return viewsIncrementLock;
    }

    return run();
  }

  public async fetchPublicStats(): Promise<AnalyticsResult<PublicLiveStats>> {
    try {
      const response = await fetch(PUBLIC_STATS_PATH, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        totalViews?: number;
        totalDownloads?: number;
        activeNow?: number;
        error?: string;
        code?: string;
        detail?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        const code = payload?.code;
        let errorCode: AnalyticsFailureCode = 'public_stats_failed';
        if (code === 'cors_origin_rejected') {
          errorCode = 'cors_origin_rejected';
        } else if (
          code === 'supabase_env_missing' ||
          code === 'supabase_connectivity_failure'
        ) {
          errorCode = 'supabase_unreachable';
        }

        return {
          data: null,
          errorCode,
          errorMessage:
            payload?.detail ||
            payload?.error ||
            `Public stats HTTP ${response.status}`,
        };
      }

      return {
        data: {
          totalViews: Number(payload.totalViews ?? 0) || 0,
          totalDownloads: Number(payload.totalDownloads ?? 0) || 0,
          activeNow: Number(payload.activeNow ?? 0) || 0,
        },
        errorCode: null,
        errorMessage: null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        data: null,
        errorCode: 'public_stats_failed',
        errorMessage: message,
      };
    }
  }

  public subscribeTotals(
    onChange: (totals: PageAnalyticsTotals) => void,
  ): () => void {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return () => undefined;
    }

    const channel = client
      .channel('page-analytics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_analytics',
          filter: `id=eq.${ANALYTICS_ROW_ID}`,
        },
        (payload) => {
          const next: unknown = payload.new;
          if (next && typeof next === 'object') {
            onChange(mapTotals(next));
          }
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }

  public joinPresence(
    payload: Omit<PresenceTrackPayload, 'visitorKey'> & {
      visitorKey?: string;
    },
    onOnlineCount: (
      count: number | null,
      errorCode?: AnalyticsFailureCode,
    ) => void,
  ): () => void {
    const client = getSupabaseBrowserClient();
    if (!client) {
      onOnlineCount(null, 'supabase_not_configured');
      return () => undefined;
    }

    const visitorKey = payload.visitorKey ?? getOrCreateVisitorKey();
    let channel: RealtimeChannel | null = client.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: visitorKey } },
    });
    let sawSubscribeError = false;

    const syncCount = () => {
      if (!channel) {
        return;
      }
      const state = channel.presenceState();
      onOnlineCount(Object.keys(state).length);
    };

    channel
      .on('presence', { event: 'sync' }, syncCount)
      .on('presence', { event: 'join' }, syncCount)
      .on('presence', { event: 'leave' }, syncCount)
      .subscribe((status) => {
        if (String(status) === 'SUBSCRIBED' && channel) {
          void channel.track({
            visitorKey,
            browserName: payload.browserName,
            operatingSystem: payload.operatingSystem,
            joinedAt: payload.joinedAt,
          });
          return;
        }

        if (
          String(status) === 'CHANNEL_ERROR' ||
          String(status) === 'TIMED_OUT'
        ) {
          sawSubscribeError = true;
          onOnlineCount(null, 'presence_failed');
        }
      });

    return () => {
      if (channel) {
        void channel.untrack();
        void client.removeChannel(channel);
        channel = null;
      }
      if (sawSubscribeError) {
        onOnlineCount(null, 'presence_failed');
      }
    };
  }
}

export const pageAnalyticsRepository = new PageAnalyticsRepository();

export function getEmptyPageAnalyticsTotals(): PageAnalyticsTotals {
  return emptyTotals();
}
