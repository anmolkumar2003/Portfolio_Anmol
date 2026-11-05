import { motion, useReducedMotion } from 'framer-motion';
import styles from './LiveMetricsTracker.module.scss';

/** Lightweight SVG cyber-robot with continuous Y-axis spin + pedestal radar. */
export function CyberRobotAvatar() {
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.avatarStage} aria-hidden="true">
      <div className={styles.avatarPerspective}>
        <motion.div
          className={styles.avatarSpin}
          animate={reduceMotion ? undefined : { rotateY: 360 }}
          transition={
            reduceMotion
              ? undefined
              : { repeat: Infinity, duration: 8, ease: 'linear' }
          }
        >
          <svg
            className={styles.robotSvg}
            viewBox="0 0 120 140"
            role="img"
            aria-label="Cyber robot avatar"
          >
            <defs>
              <linearGradient id="armor" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="55%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="visorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f3ff" />
                <stop offset="100%" stopColor="#39ff14" />
              </linearGradient>
              <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Antenna */}
            <rect x="56" y="8" width="8" height="14" rx="2" fill="#334155" />
            <circle cx="60" cy="8" r="5" fill="#00f3ff" filter="url(#softGlow)" />

            {/* Head */}
            <rect
              x="28"
              y="22"
              width="64"
              height="42"
              rx="10"
              fill="url(#armor)"
              stroke="#00f3ff"
              strokeOpacity="0.45"
              strokeWidth="1.5"
            />
            <rect
              x="36"
              y="36"
              width="48"
              height="12"
              rx="4"
              fill="#020617"
              stroke="url(#visorGlow)"
              strokeWidth="1.5"
              filter="url(#softGlow)"
            />
            <circle cx="48" cy="42" r="2.5" fill="#00f3ff" />
            <circle cx="72" cy="42" r="2.5" fill="#00f3ff" />

            {/* Torso */}
            <rect
              x="34"
              y="68"
              width="52"
              height="46"
              rx="8"
              fill="url(#armor)"
              stroke="#00f3ff"
              strokeOpacity="0.35"
              strokeWidth="1.4"
            />
            <circle
              cx="60"
              cy="90"
              r="8"
              fill="#041018"
              stroke="#00f3ff"
              strokeWidth="1.5"
              filter="url(#softGlow)"
            />
            <circle cx="60" cy="90" r="3" fill="#39ff14" />

            {/* Arms */}
            <rect
              x="14"
              y="72"
              width="16"
              height="34"
              rx="6"
              fill="url(#armor)"
              stroke="#00f3ff"
              strokeOpacity="0.3"
            />
            <rect
              x="90"
              y="72"
              width="16"
              height="34"
              rx="6"
              fill="url(#armor)"
              stroke="#00f3ff"
              strokeOpacity="0.3"
            />
          </svg>
        </motion.div>
      </div>

      <div className={styles.pedestal}>
        <span className={styles.pedestalRing} />
        <span className={styles.pedestalRingDelayed} />
        <span className={styles.radarGrid} />
      </div>
      <p className={styles.avatarCaption}>System Avatar // Presence</p>
    </div>
  );
}
