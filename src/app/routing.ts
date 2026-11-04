export type AppRoute = 'home' | 'telemetry' | 'not-found';

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function normalizeBase(): string {
  return import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';
}

export function resolveRoute(pathname: string): AppRoute {
  const normalized = normalizePath(pathname);
  const base = normalizeBase();

  const relative =
    base === '/'
      ? normalized
      : normalized === base
        ? '/'
        : normalized.startsWith(`${base}/`)
          ? normalized.slice(base.length) || '/'
          : normalized;

  if (
    relative === '/' ||
    relative === '/index.html' ||
    normalized === `${base}/index.html`
  ) {
    return 'home';
  }

  if (
    relative === '/admin/telemetry' ||
    relative === '/admin/telemetry/index.html'
  ) {
    return 'telemetry';
  }

  return 'not-found';
}

export function isHomePath(pathname: string): boolean {
  return resolveRoute(pathname) === 'home';
}
