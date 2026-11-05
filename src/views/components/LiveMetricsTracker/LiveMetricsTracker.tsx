import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Activity, X } from 'lucide-react';
import { useId, useState } from 'react';
import { useLiveMetrics } from '@viewmodels';
import type { LiveMetricsController } from '@viewmodels';
import { CyberRobotAvatar } from './CyberRobotAvatar';
import styles from './LiveMetricsTracker.module.scss';

function formatCount(value: number | null): string {
  if (value === null) {
    return '—';
  }
  return new Intl.NumberFormat('en-US').format(value);
}

function Metric({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricLabel}>{label}</span>
      <span
        className={`${styles.metricValue} ${warn ? styles.metricValueWarn : styles.metricValueAccent}`}
      >
        {value}
      </span>
    </div>
  );
}

function TelemetryPanel({
  metrics,
  onClose,
}: {
  metrics: LiveMetricsController;
  onClose: () => void;
}) {
  const {
    totals,
    onlineCount,
    visitor,
    loading,
    error,
    errorCode,
    supabaseReady,
    diagnosticsHost,
  } = metrics;

  const countsUnavailable = totals === null;

  return (
    <div className={styles.hud} role="dialog" aria-modal="false" aria-label="Live telemetry">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Cyber-OS // Telemetry</p>
          <h2 className={styles.title}>System Diagnostics // Live</h2>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.livePill} data-online={!loading && !error}>
            <span className={styles.pulse} aria-hidden="true" />
            [{loading ? 'SYNC' : error ? 'DEGRADED' : 'ONLINE'}]
          </span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close live telemetry"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className={styles.panels}>
        <section className={styles.avatarPanel}>
          <CyberRobotAvatar />
        </section>

        <section className={styles.diagnosticsPanel}>
          <div className={styles.metricsGrid}>
            <Metric
              label="Views"
              value={formatCount(totals?.totalViews ?? null)}
              warn={countsUnavailable}
            />
            <Metric
              label="Downloads"
              value={formatCount(totals?.totalDownloads ?? null)}
              warn={countsUnavailable}
            />
            <Metric
              label="Active now"
              value={formatCount(onlineCount)}
              warn={onlineCount === null}
            />
            <Metric label="Browser" value={visitor.browserName} />
            <Metric label="OS" value={visitor.operatingSystem} />
            <Metric label="Language" value={visitor.language} />
          </div>

          <p className={styles.footer}>
            channel · telemetry-room
            {!supabaseReady ? ' · supabase offline' : ''}
            {import.meta.env.DEV && diagnosticsHost
              ? ` · host ${diagnosticsHost}`
              : ''}
            {import.meta.env.DEV && errorCode ? ` · ${errorCode}` : ''}
          </p>
          {error ? <p className={styles.error}>{error}</p> : null}
        </section>
      </div>
    </div>
  );
}

/** Floating LIVE toggle + Cyber-OS glass HUD (aggregates only — no visitor IPs). */
export function LiveMetricsTracker() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const metrics = useLiveMetrics();

  return (
    <aside className={styles.root} aria-label="Live telemetry controls">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="telemetry-hud"
            id={panelId}
            className={styles.hudShell}
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <TelemetryPanel metrics={metrics} onClose={() => setOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        className={styles.liveToggle}
        data-active={open}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          setOpen((value) => !value);
        }}
      >
        <span className={styles.liveTogglePulse} aria-hidden="true" />
        <Activity size={15} aria-hidden="true" />
        {open ? 'Hide' : 'Live'}
      </button>
    </aside>
  );
}

export { LiveMetricsTracker as CyberHUD };
