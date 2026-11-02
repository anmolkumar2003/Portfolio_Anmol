import type { MouseEventHandler, ReactNode } from 'react';
import styles from './Button.module.scss';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  ariaCurrent?: 'page' | undefined;
}

export function Button({
  children,
  href,
  variant = 'primary',
  onClick,
  type = 'button',
  ariaLabel,
  ariaCurrent,
}: ButtonProps) {
  const className = `${styles.button} ${styles[variant]}`;

  if (href) {
    const isHash = href.startsWith('#');

    return (
      <a
        className={className}
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-current={ariaCurrent}
        target={isHash ? undefined : '_blank'}
        rel={isHash ? undefined : 'noreferrer noopener'}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={className}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </button>
  );
}
