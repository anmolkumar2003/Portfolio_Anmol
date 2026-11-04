import { useEffect, useState } from 'react';
import type { TelemetryStats, VisitorSessionRecord } from '@models';
import {
  telemetryDashboardRepository,
  telemetryRepository,
} from '@repositories';

const DEFAULT_INACTIVE_MS = 300_000;

export interface TelemetryDashboardState {
  stats: TelemetryStats;
  sessions: VisitorSessionRecord[];
  selectedSessionId: string | null;
  selectedSession: VisitorSessionRecord | null;
  loading: boolean;
  selectSession: (id: string | null) => void;
  refresh: () => Promise<void>;
}

function emptyStats(): TelemetryStats {
  return {
    trackingStartedAt: null,
    totalVisits: 0,
    approximateUniqueVisitors: 0,
    activeSessions: 0,
    activeWatchers: 0,
  };
}

function isLiveActive(
  session: VisitorSessionRecord,
  inactiveMs: number,
): boolean {
  if (!session.is_active) {
    return false;
  }
  const last = Date.parse(session.last_active_at);
  if (!Number.isFinite(last)) {
    return false;
  }
  return Date.now() - last <= inactiveMs;
}

export function useTelemetryDashboard(
  accessToken: string | undefined,
  enabled: boolean,
): TelemetryDashboardState {
  const [stats, setStats] = useState<TelemetryStats>(emptyStats);
  const [sessions, setSessions] = useState<VisitorSessionRecord[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(enabled);

  const inactiveMs = DEFAULT_INACTIVE_MS;

  const refresh = async () => {
    const [nextStats, nextSessions] = await Promise.all([
      telemetryDashboardRepository.fetchStats(inactiveMs),
      telemetryDashboardRepository.fetchSessions(150),
    ]);

    setStats(nextStats);
    setSessions(
      nextSessions.map((session) => ({
        ...session,
        is_active: isLiveActive(session, inactiveMs),
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    const run = () => {
      if (!cancelled) {
        void refresh();
      }
    };

    const initialTimer = window.setTimeout(run, 0);

    const unsubSessions = telemetryDashboardRepository.subscribeSessions(run);
    const unsubWatchers = telemetryDashboardRepository.subscribeWatchers(run);
    const unsubVisitors = telemetryDashboardRepository.subscribeVisitors(run);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimer);
      unsubSessions();
      unsubWatchers();
      unsubVisitors();
    };
    // Mount/subscribe lifecycle only; refresh closes over stable inactiveMs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !accessToken) {
      return;
    }

    const watcherKey = telemetryRepository.createWatcherKey();
    let cancelled = false;

    const beat = () => {
      if (!cancelled) {
        void telemetryRepository.watch(accessToken, watcherKey);
      }
    };

    beat();
    const timer = window.setInterval(beat, 30_000);

    const onHide = () => {
      telemetryRepository.endWatch(accessToken, watcherKey);
    };

    window.addEventListener('pagehide', onHide);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener('pagehide', onHide);
      telemetryRepository.endWatch(accessToken, watcherKey);
    };
  }, [enabled, accessToken]);

  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) ?? null;

  return {
    stats,
    sessions,
    selectedSessionId,
    selectedSession,
    loading,
    selectSession: setSelectedSessionId,
    refresh,
  };
}
