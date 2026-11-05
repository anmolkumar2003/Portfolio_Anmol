import { useCallback, useEffect, useState } from 'react';
import type { LiveMetricsState, PageAnalyticsTotals } from '@models';
import {
  collectVisitorSystemTelemetry,
  getEmptyPageAnalyticsTotals,
  pageAnalyticsRepository,
} from '@repositories';

const INITIAL: LiveMetricsState = {
  totals: getEmptyPageAnalyticsTotals(),
  onlineCount: 0,
  visitor: {
    publicIp: null,
    browserName: '…',
    operatingSystem: '…',
    screenResolution: '…',
    language: '…',
    ipLookupFailed: false,
  },
  loading: true,
  error: null,
  supabaseReady: false,
};

export interface LiveMetricsController extends LiveMetricsState {
  trackDownload: () => Promise<void>;
}

export function useLiveMetrics(): LiveMetricsController {
  const [state, setState] = useState<LiveMetricsState>(INITIAL);

  const applyTotals = useCallback((totals: PageAnalyticsTotals) => {
    setState((prev) => ({ ...prev, totals }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    void (async () => {
      const visitor = await collectVisitorSystemTelemetry();
      if (cancelled) {
        return;
      }

      const supabaseReady = pageAnalyticsRepository.isConfigured();
      setState((prev) => ({
        ...prev,
        visitor,
        supabaseReady,
        loading: supabaseReady,
        error: supabaseReady
          ? null
          : 'Supabase is not configured — live counters unavailable.',
      }));

      if (!supabaseReady) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      const existing = await pageAnalyticsRepository.fetchTotals();
      if (cancelled) {
        return;
      }

      if (existing) {
        applyTotals(existing);
      }

      const afterView = await pageAnalyticsRepository.increment('views');
      if (cancelled) {
        return;
      }

      if (afterView) {
        applyTotals(afterView);
      } else if (!existing) {
        setState((prev) => ({
          ...prev,
          error:
            prev.error ??
            'Could not reach analytics — counters may be unavailable.',
        }));
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
          (onlineCount) => {
            if (!cancelled) {
              setState((prev) => ({ ...prev, onlineCount }));
            }
          },
        ),
      );
    })();

    return () => {
      cancelled = true;
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [applyTotals]);

  const trackDownload = useCallback(async () => {
    const next = await pageAnalyticsRepository.increment('downloads');
    if (next) {
      applyTotals(next);
    }
  }, [applyTotals]);

  return {
    ...state,
    trackDownload,
  };
}
