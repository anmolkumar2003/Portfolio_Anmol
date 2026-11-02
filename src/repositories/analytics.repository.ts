import { type AnalyticsEventName, type AnalyticsProps } from '@models';

interface PlausibleQueue {
  (...args: unknown[]): void;
  q?: unknown[][];
}

declare global {
  interface Window {
    plausible?: PlausibleQueue;
  }
}

export interface IAnalyticsRepository {
  init(): void;
  track(name: AnalyticsEventName, props?: AnalyticsProps): void;
}

function plausibleDomain(): string | null {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN?.trim();
  return domain && domain.length > 0 ? domain : null;
}

export class AnalyticsRepository implements IAnalyticsRepository {
  public init(): void {
    const domain = plausibleDomain();

    if (!domain || document.querySelector('script[data-analytics="plausible"]')) {
      return;
    }

    window.plausible =
      window.plausible ??
      function plausible(...args: unknown[]) {
        (window.plausible as PlausibleQueue).q = (
          window.plausible as PlausibleQueue
        ).q ?? [];
        (window.plausible as PlausibleQueue).q?.push(args);
      };

    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = domain;
    script.dataset.analytics = 'plausible';
    script.src =
      import.meta.env.VITE_PLAUSIBLE_SRC?.trim() ||
      'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }

  public track(name: AnalyticsEventName, props?: AnalyticsProps): void {
    if (!plausibleDomain()) {
      return;
    }

    window.plausible?.(name, props ? { props } : undefined);
  }
}

export const analyticsRepository = new AnalyticsRepository();
