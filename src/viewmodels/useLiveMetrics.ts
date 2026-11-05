import { useCallback, useEffect, useState } from 'react';
import type {
  AnalyticsFailureCode,
  LiveMetricsState,
  PageAnalyticsTotals,
} from '@models';
import {
  collectVisitorSystemTelemetry,
  pageAnalyticsRepository,
} from '@repositories';

const POLL_MS = 20_000;

const INITIAL: LiveMetricsState = {
  totals: null,
  onlineCount: null,
  visitor: {
    browserName: '…',
    operatingSystem: '…',
    screenResolution: '…',
    language: '…',
  },
  loading: true,
  error: null,
  errorCode: null,
  supabaseReady: false,
  diagnosticsHost: null,
};

function formatLiveError(
  code: AnalyticsFailureCode | null,
  detail: string | null,
): string {
  const isDev = import.meta.env.DEV;

  switch (code) {
    case 'supabase_not_configured':
      return isDev
        ? 'Supabase env missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).'
        : 'Live counters are not configured.';
    case 'supabase_unreachable':
      return isDev
        ? `Cannot reach Supabase${detail ? `: ${detail}` : ''}. Check the project URL host.`
        : 'Cannot reach analytics service.';
    case 'analytics_table_missing':
      return isDev
        ? 'page_analytics missing — apply supabase/migrations/002_page_analytics.sql.'
        : 'Analytics storage is unavailable.';
    case 'rpc_failed':
      return isDev
        ? `increment_counter failed${detail ? `: ${detail}` : ''}.`
        : 'Could not update live counters.';
    case 'presence_failed':
      return isDev
        ? 'Realtime presence channel failed — Active Now may be unavailable.'
        : 'Live presence is temporarily unavailable.';
    case 'cors_origin_rejected':
      return isDev
        ? 'Telemetry API rejected Origin (ALLOWED_ORIGINS / CORS).'
        : 'Telemetry API blocked this origin.';
    case 'public_stats_failed':
      return isDev
        ? `Public stats API failed${detail ? `: ${detail}` : ''}.`
        : 'Session stats are temporarily unavailable.';
    default:
      return isDev
        ? detail || 'Unknown analytics error.'
        : 'Live telemetry is temporarily unavailable.';
  }
}

export interface LiveMetricsController extends LiveMetricsState {
  trackDownload: () => Promise<void>;
}

export function useLiveMetrics(): LiveMetricsController {
  const [state, setState] = useState<LiveMetricsState>(INITIAL);

  const applyTotals = useCallback((totals: PageAnalyticsTotals) => {
    setState((prev) => ({
      ...prev,
      totals,
      error: null,
      errorCode: null,
    }));
  }, []);

  const setFailure = useCallback(
    (errorCode: AnalyticsFailureCode, detail: string | null) => {
      setState((prev) => ({
        ...prev,
        error: formatLiveError(errorCode, detail),
        errorCode,
      }));
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const cleanups: Array<() => void> = [];
    let pollTimer: number | undefined;

    void (async () => {
      const visitor = collectVisitorSystemTelemetry();
      if (cancelled) {
        return;
      }

      const supabaseReady = pageAnalyticsRepository.isConfigured();
      const diagnosticsHost = pageAnalyticsRepository.getConfiguredHost();

      setState((prev) => ({
        ...prev,
        visitor,
        supabaseReady,
        diagnosticsHost,
        loading: true,
        error: supabaseReady
          ? null
          : formatLiveError('supabase_not_configured', null),
        errorCode: supabaseReady ? null : 'supabase_not_configured',
      }));

      if (!supabaseReady) {
        setState((prev) => ({ ...prev, loading: false, totals: null }));
        return;
      }

      const existing = await pageAnalyticsRepository.fetchTotals();
      if (cancelled) {
        return;
      }

      if (existing.data) {
        applyTotals(existing.data);
      }

      const afterView = await pageAnalyticsRepository.increment('views');
      if (cancelled) {
        return;
      }

      if (afterView.data) {
        applyTotals(afterView.data);
      } else if (!existing.data) {
        // Direct Supabase path failed — try same-origin public stats (service role).
        const publicStats = await pageAnalyticsRepository.fetchPublicStats();
        if (cancelled) {
          return;
        }

        if (publicStats.data) {
          setState((prev) => ({
            ...prev,
            totals: {
              totalViews: publicStats.data!.totalViews,
              totalDownloads: publicStats.data!.totalDownloads,
            },
            onlineCount: publicStats.data!.activeNow,
            error: null,
            errorCode: null,
          }));
        } else {
          setFailure(
            existing.errorCode ??
              afterView.errorCode ??
              publicStats.errorCode ??
              'unknown',
            existing.errorMessage ??
              afterView.errorMessage ??
              publicStats.errorMessage,
          );
          setState((prev) => ({ ...prev, totals: null }));
        }
      } else if (afterView.errorCode) {
        // Counters readable, increment soft-failed (still show known totals).
        setFailure(afterView.errorCode, afterView.errorMessage);
      }

      setState((prev) => ({ ...prev, loading: false }));

      cleanups.push(
        pageAnalyticsRepository.subscribeTotals((totals) => {
          if (!cancelled) {
            applyTotals(totals);
          }
        }),
      );

      cleanups.push(
        pageAnalyticsRepository.joinPresence(
          {
            browserName: visitor.browserName,
            operatingSystem: visitor.operatingSystem,
            joinedAt: new Date().toISOString(),
          },
          (onlineCount, presenceError) => {
            if (cancelled) {
              return;
            }

            if (onlineCount === null && presenceError) {
              setState((prev) => ({
                ...prev,
                onlineCount: prev.onlineCount,
                error: prev.totals
                  ? prev.error
                  : formatLiveError(presenceError, null),
                errorCode: prev.totals ? prev.errorCode : presenceError,
              }));
              return;
            }

            setState((prev) => ({
              ...prev,
              onlineCount,
            }));
          },
        ),
      );

      // Lightweight polling fallback when Realtime misses counter updates.
      pollTimer = window.setInterval(() => {
        void (async () => {
          const [nextTotals, publicStats] = await Promise.all([
            pageAnalyticsRepository.fetchTotals(),
            pageAnalyticsRepository.fetchPublicStats(),
          ]);

          if (cancelled) {
            return;
          }

          if (nextTotals.data) {
            applyTotals(nextTotals.data);
          }

          if (publicStats.data) {
            setState((prev) => ({
              ...prev,
              // Prefer Realtime presence when connected; otherwise use active sessions.
              onlineCount:
                prev.onlineCount === null
                  ? publicStats.data!.activeNow
                  : prev.onlineCount,
              totals: nextTotals.data ?? {
                totalViews: publicStats.data!.totalViews,
                totalDownloads: publicStats.data!.totalDownloads,
              },
            }));
          }
        })();
      }, POLL_MS);

      cleanups.push(() => {
        if (pollTimer !== undefined) {
          window.clearInterval(pollTimer);
        }
      });
    })();

    return () => {
      cancelled = true;
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [applyTotals, setFailure]);

  const trackDownload = useCallback(async () => {
    const next = await pageAnalyticsRepository.increment('downloads');
    if (next.data) {
      applyTotals(next.data);
    }
  }, [applyTotals]);

  return {
    ...state,
    trackDownload,
  };
}
