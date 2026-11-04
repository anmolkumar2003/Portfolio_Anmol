import { useEffect } from 'react';
import { telemetryRepository } from '@repositories';

/**
 * Starts a first-party visitor session on the public portfolio.
 * Idempotent under React Strict Mode via repository-level locking.
 */
export function useVisitorTelemetry(): void {
  useEffect(() => {
    if (!telemetryRepository.isEnabled()) {
      return;
    }

    let cancelled = false;
    let heartbeatTimer: number | undefined;
    let sessionKey: string | null = null;

    const onPageHide = () => {
      if (sessionKey) {
        telemetryRepository.endSession(sessionKey);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && sessionKey) {
        void telemetryRepository.heartbeat(sessionKey);
      }
    };

    void (async () => {
      const key = await telemetryRepository.startSession();
      if (cancelled || !key) {
        return;
      }

      sessionKey = key;
      const interval = telemetryRepository.getHeartbeatIntervalMs();
      heartbeatTimer = window.setInterval(() => {
        void telemetryRepository.heartbeat(key);
      }, interval);
    })();

    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      if (heartbeatTimer !== undefined) {
        window.clearInterval(heartbeatTimer);
      }
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibility);
      // Do not end the session on Strict Mode remount cleanup.
      // pagehide / tab close handles true exits.
    };
  }, []);
}
