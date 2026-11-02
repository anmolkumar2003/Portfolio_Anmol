import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function SafeImage({ src, alt, className, width, height }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={className}
        role="img"
        aria-label={alt}
        style={{
          minHeight: height ? `${String(height)}px` : '12rem',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
      />
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => {
        setFailed(true);
      }}
    />
  );
}
