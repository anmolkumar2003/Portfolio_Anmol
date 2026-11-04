import type { TelemetryStats, VisitorSessionRecord } from '@models';
import { getSupabaseBrowserClient } from './supabase.client';

const ACTIVE_WATCHER_MS = 120_000;

export interface ITelemetryDashboardRepository {
  fetchStats(inactiveMs: number): Promise<TelemetryStats>;
  fetchSessions(limit?: number): Promise<VisitorSessionRecord[]>;
  subscribeSessions(
    onChange: () => void,
  ): () => void;
  subscribeWatchers(onChange: () => void): () => void;
  subscribeVisitors(onChange: () => void): () => void;
  isAdminUser(userId: string): Promise<boolean>;
}

function inactiveCutoffIso(inactiveMs: number): string {
  return new Date(Date.now() - inactiveMs).toISOString();
}

function watcherCutoffIso(): string {
  return new Date(Date.now() - ACTIVE_WATCHER_MS).toISOString();
}

function readTimestamptz(row: unknown): string | null {
  if (!row || typeof row !== 'object') {
    return null;
  }

  if (!('value_timestamptz' in row)) {
    return null;
  }

  const value = row.value_timestamptz;
  return typeof value === 'string' ? value : null;
}

function mapSessionRows(rows: unknown): VisitorSessionRecord[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.filter(isVisitorSessionRecord);
}

function isVisitorSessionRecord(row: unknown): row is VisitorSessionRecord {
  if (!row || typeof row !== 'object') {
    return false;
  }

  const candidate = row as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.session_key === 'string' &&
    typeof candidate.visitor_id === 'string' &&
    typeof candidate.is_active === 'boolean' &&
    typeof candidate.started_at === 'string' &&
    typeof candidate.last_active_at === 'string'
  );
}

export class TelemetryDashboardRepository
  implements ITelemetryDashboardRepository
{
  public async isAdminUser(userId: string): Promise<boolean> {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return false;
    }

    const { data, error } = await client
      .from('admin_allowlist')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    return Boolean(data && !error);
  }

  public async fetchStats(inactiveMs: number): Promise<TelemetryStats> {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return {
        trackingStartedAt: null,
        totalVisits: 0,
        approximateUniqueVisitors: 0,
        activeSessions: 0,
        activeWatchers: 0,
      };
    }

    const cutoff = inactiveCutoffIso(inactiveMs);
    const watcherCutoff = watcherCutoffIso();

    const [
      metaResult,
      visitsResult,
      uniquesResult,
      activeResult,
      watchersResult,
    ] = await Promise.all([
      client
        .from('telemetry_meta')
        .select('value_timestamptz')
        .eq('key', 'tracking_started_at')
        .maybeSingle(),
      client.from('sessions').select('id', { count: 'exact', head: true }),
      client.from('visitors').select('id', { count: 'exact', head: true }),
      client
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .gt('last_active_at', cutoff),
      client
        .from('watchers')
        .select('id', { count: 'exact', head: true })
        .gt('last_seen_at', watcherCutoff),
    ]);

    const trackingStartedAt = readTimestamptz(metaResult.data);

    return {
      trackingStartedAt,
      totalVisits: visitsResult.count ?? 0,
      approximateUniqueVisitors: uniquesResult.count ?? 0,
      activeSessions: activeResult.count ?? 0,
      activeWatchers: watchersResult.count ?? 0,
    };
  }

  public async fetchSessions(limit = 100): Promise<VisitorSessionRecord[]> {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from('sessions')
      .select('*')
      .order('last_active_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return mapSessionRows(data);
  }

  public subscribeSessions(onChange: () => void): () => void {
    return this.subscribeTable('sessions', onChange);
  }

  public subscribeWatchers(onChange: () => void): () => void {
    return this.subscribeTable('watchers', onChange);
  }

  public subscribeVisitors(onChange: () => void): () => void {
    return this.subscribeTable('visitors', onChange);
  }

  private subscribeTable(table: string, onChange: () => void): () => void {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return () => undefined;
    }

    const channel = client
      .channel(`telemetry-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          onChange();
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }
}

export const telemetryDashboardRepository =
  new TelemetryDashboardRepository();
