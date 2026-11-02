import { useReducedMotion } from 'framer-motion';
import { useCallback, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useFinePointer } from '@views/hooks/useFinePointer';
import styles from './TiltCard.module.scss';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function TiltCard({ children, className, intensity = 6 }: TiltCardProps) {
  const reduceMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const enabled = Boolean(!reduceMotion && finePointer);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const node = ref.current;

      if (!node || !enabled) {
        return;
      }

      const bounds = node.getBoundingClientRect();
      const px = (event.clientX - bounds.left) / bounds.width - 0.5;
      const py = (event.clientY - bounds.top) / bounds.height - 0.5;
      setTilt({ x: -(py * intensity), y: px * intensity });
    },
    [enabled, intensity],
  );

  const onPointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.tilt} ${className ?? ''}`}
      onPointerMove={enabled ? onPointerMove : undefined}
      onPointerLeave={enabled ? onPointerLeave : undefined}
      style={
        enabled
          ? {
              transform: `perspective(920px) rotateX(${String(tilt.x)}deg) rotateY(${String(tilt.y)}deg)`,
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
