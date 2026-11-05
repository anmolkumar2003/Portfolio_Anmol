import type { RealtimeChannel } from '@supabase/supabase-js';
import type { AnalyticsMetric, PageAnalyticsTotals } from '@models';
import { getSupabaseBrowserClient, isSupabaseConfigured } from './supabase.client';
import { getOrCreateVisitorKey } from './telemetry.ids';

const PRESENCE_CHANNEL = 'telemetry-room';
const ANALYTICS_ROW_ID = 1;

export interface PresenceTrackPayload {
  readonly visitorKey: string;
  readonly browserName: string;
  readonly operatingSystem: string;
  readonly joinedAt: string;
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

export interface IPageAnalyticsRepository {
  isConfigured(): boolean;
  fetchTotals(): Promise<PageAnalyticsTotals | null>;
  increment(metric: AnalyticsMetric): Promise<PageAnalyticsTotals | null>;
  subscribeTotals(
    onChange: (totals: PageAnalyticsTotals) => void,
  ): () => void;
  joinPresence(
    payload: Omit<PresenceTrackPayload, 'visitorKey'> & {
      visitorKey?: string;
    },
    onOnlineCount: (count: number) => void,
  ): () => void;
}

let viewsIncrementLock: Promise<PageAnalyticsTotals | null> | null = null;

export class PageAnalyticsRepository implements IPageAnalyticsRepository {
  public isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  public async fetchTotals(): Promise<PageAnalyticsTotals | null> {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return null;
    }

    const { data, error } = await client
      .from('page_analytics')
      .select('total_views, total_downloads')
      .eq('id', ANALYTICS_ROW_ID)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapTotals(data);
  }

  public async increment(
    metric: AnalyticsMetric,
  ): Promise<PageAnalyticsTotals | null> {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return null;
    }

    const run = async () => {
      const response = await client.rpc('increment_counter', {
        metric,
      });
      const data: unknown = response.data;

      if (response.error || data == null) {
        return null;
      }

      const row: unknown = Array.isArray(data) ? data[0] : data;
      if (!row || typeof row !== 'object') {
        return null;
      }

      return mapTotals(row);
    };

    // Keep the views promise for this page lifetime so Strict Mode remounts do not double-count.
    if (metric === 'views') {
      if (!viewsIncrementLock) {
        viewsIncrementLock = run();
      }
      return viewsIncrementLock;
    }

    return run();
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
    onOnlineCount: (count: number) => void,
  ): () => void {
    const client = getSupabaseBrowserClient();
    if (!client) {
      onOnlineCount(0);
      return () => undefined;
    }

    const visitorKey = payload.visitorKey ?? getOrCreateVisitorKey();
    let channel: RealtimeChannel | null = client.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: visitorKey } },
    });

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
        }
      });

    return () => {
      if (channel) {
        void channel.untrack();
        void client.removeChannel(channel);
        channel = null;
      }
    };
  }
}

export const pageAnalyticsRepository = new PageAnalyticsRepository();

export function getEmptyPageAnalyticsTotals(): PageAnalyticsTotals {
  return emptyTotals();
}
