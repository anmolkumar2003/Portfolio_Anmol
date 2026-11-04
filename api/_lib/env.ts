function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
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
