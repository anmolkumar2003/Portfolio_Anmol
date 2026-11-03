import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useState, type PointerEvent } from 'react';
import iphone18ProBezel from '@assets/devices/iphone-18-pro-bezel.webp';
import { useFinePointer } from '@views/hooks/useFinePointer';
import { DeviceScreen } from './DeviceScreen';
import { SafeImage } from './SafeImage';
import styles from './DeviceMockup.module.scss';

interface DeviceMockupProps {
  title: string;
  screenshotSrc?: string | null;
  screenId?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  floating?: boolean;
  interactive?: boolean;
}

export function DeviceMockup({
  title,
  screenshotSrc = null,
  screenId = 'hero',
  size = 'md',
  animated = false,
  floating = false,
  interactive = false,
}: DeviceMockupProps) {
  const reduceMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const hasScreenshot = Boolean(screenshotSrc);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const canTilt = Boolean(!reduceMotion && finePointer && interactive);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!canTilt) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      const px = (event.clientX - bounds.left) / bounds.width - 0.5;
      const py = (event.clientY - bounds.top) / bounds.height - 0.5;
      setTilt({ x: -(py * 8), y: px * 10 });
    },
    [canTilt],
  );

  return (
    <div className={`${styles.stage} ${styles[size]}`}>
      <div className={styles.glow} aria-hidden="true" />
      <motion.div
        className={styles.lift}
        initial={
          animated && !reduceMotion ? { opacity: 0, y: 22, scale: 0.96 } : false
        }
        whileInView={
          animated && !reduceMotion ? { opacity: 1, y: 0, scale: 1 } : undefined
        }
        animate={
          floating && !reduceMotion ? { y: [0, -10, 0] } : undefined
        }
        viewport={{ once: true, amount: 0.3 }}
        transition={
          floating && !reduceMotion
            ? { y: { duration: 5.8, repeat: Infinity, ease: 'easeInOut' } }
            : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <div
          className={styles.frame}
          onPointerMove={canTilt ? onPointerMove : undefined}
          onPointerLeave={canTilt ? () => setTilt({ x: 0, y: 0 }) : undefined}
          style={
            canTilt
              ? {
                  transform: `perspective(980px) rotateX(${String(tilt.x)}deg) rotateY(${String(tilt.y)}deg)`,
                }
              : undefined
          }
        >
          <div className={styles.screen}>
            {hasScreenshot && screenshotSrc ? (
              <SafeImage
                className={styles.screenshot}
                src={screenshotSrc}
                alt={`${title} application screenshot`}
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  className={styles.screenInner}
                  key={screenId}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <DeviceScreen variant={screenId} />
                </motion.div>
              </AnimatePresence>
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
        </div>
      </motion.div>
    </div>
  );
}
