import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  mode?: 'scroll' | 'mount';
}

export function FadeIn({
  children,
  className,
  delay = 0,
  mode = 'scroll',
}: FadeInProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const transition = {
    duration: 0.55,
    delay,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  if (mode === 'mount') {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14, margin: '0px 0px -6% 0px' }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
