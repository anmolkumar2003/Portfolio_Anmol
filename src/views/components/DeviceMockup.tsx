import { motion, useReducedMotion } from 'framer-motion';
import iphone18ProBezel from '@assets/devices/iphone-18-pro-bezel.png';
import { SafeImage } from './SafeImage';
import styles from './DeviceMockup.module.scss';

interface DeviceMockupProps {
  title: string;
  screenshotSrc?: string | null;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function DeviceMockup({
  title,
  screenshotSrc = null,
  size = 'md',
  animated = false,
}: DeviceMockupProps) {
  const reduceMotion = useReducedMotion();
  const hasScreenshot = Boolean(screenshotSrc);

  return (
    <div className={`${styles.stage} ${styles[size]}`}>
      <div className={styles.glow} aria-hidden="true" />
      <motion.div
        className={styles.frame}
        initial={
          animated && !reduceMotion ? { opacity: 0, y: 22, scale: 0.96 } : false
        }
        whileInView={
          animated && !reduceMotion ? { opacity: 1, y: 0, scale: 1 } : undefined
        }
        whileHover={reduceMotion ? undefined : { scale: 1.03 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.screen}>
          {hasScreenshot && screenshotSrc ? (
            <SafeImage
              className={styles.screenshot}
              src={screenshotSrc}
              alt={`${title} application screenshot`}
            />
          ) : (
            <div className={styles.placeholder} aria-hidden="true" />
          )}
        </div>
        <img
          className={styles.bezel}
          src={iphone18ProBezel}
          alt=""
          width={1350}
          height={2760}
          decoding="async"
        />
      </motion.div>
    </div>
  );
}
