import { motion, useReducedMotion } from 'framer-motion';
import styles from './ScrollProgress.module.scss';

interface ScrollProgressProps {
  progress: number;
}

export function ScrollProgress({ progress }: ScrollProgressProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={styles.bar}
      style={{
        scaleX: progress,
        transition: reduceMotion ? 'none' : 'transform 120ms linear',
      }}
      aria-hidden="true"
    />
  );
}
