function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim().replace(/\/$/, '');
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

/** Configured allowlist plus Vercel deployment URLs (production + preview). */
export function getAllowedOrigins(): string[] {
  const configured = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin));

  const automatic: string[] = [];

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const normalized = normalizeOrigin(vercelUrl);
    if (normalized) {
      automatic.push(normalized);
    }
  }

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) {
    const normalized = normalizeOrigin(productionUrl);
    if (normalized) {
      automatic.push(normalized);
    }
  }

  return [...new Set([...configured, ...automatic])];
}

export function getServerEnv() {
  return {
    supabaseUrl: required('SUPABASE_URL'),
    supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
    inactiveMs: Number(process.env.TELEMETRY_INACTIVE_MS ?? '300000'),
    rateLimitPerMin: Number(process.env.TELEMETRY_RATE_LIMIT_PER_MIN ?? '60'),
    watcherStaleMs: Number(process.env.TELEMETRY_WATCHER_STALE_MS ?? '120000'),
    ipIntelProvider: (process.env.IP_INTEL_PROVIDER ?? 'none').trim().toLowerCase(),
    ipIntelApiKey: process.env.IP_INTEL_API_KEY?.trim() ?? '',
    allowedOrigins: getAllowedOrigins(),
  };
}
