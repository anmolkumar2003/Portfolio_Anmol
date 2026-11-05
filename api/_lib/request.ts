import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors, rejectIfOriginBlocked } from './cors.js';
import { getServerEnv } from './env.js';
import { readHeader } from './headers.js';
import { isRateLimited, pruneRateLimitBuckets } from './rate-limit.js';

function firstForwardedIp(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.length > 0) {
    const first = value.split(',')[0]?.trim();
    return first || null;
  }

  if (Array.isArray(value) && value[0]) {
    return value[0].split(',')[0]?.trim() || null;
  }

  return null;
}

/**
 * Prefer Vercel-trusted client IP headers. Never accept a client-submitted body IP.
 * Handles IPv4 and IPv6 literals from the proxy chain.
 */
export function clientIp(req: VercelRequest): string {
  const vercelForwarded = firstForwardedIp(
    req.headers['x-vercel-forwarded-for'],
  );
  if (vercelForwarded) {
    return vercelForwarded;
  }

  const forwarded = firstForwardedIp(req.headers['x-forwarded-for']);
  if (forwarded) {
    return forwarded;
  }

  const realIp = readHeader(req.headers['x-real-ip']);
  if (realIp) {
    return realIp;
  }

  return req.socket.remoteAddress ?? 'unknown';
}

/** Diagnostic snapshot for admin IP verification (no secrets). */
export function clientIpDiagnostics(req: VercelRequest): {
  clientIp: string;
  headers: {
    xVercelForwardedFor: string | null;
    xForwardedFor: string | null;
    xRealIp: string | null;
  };
  vercelGeoCountry: string | null;
  vercelGeoRegion: string | null;
  vercelGeoCity: string | null;
} {
  return {
    clientIp: clientIp(req),
    headers: {
      xVercelForwardedFor:
        firstForwardedIp(req.headers['x-vercel-forwarded-for']) ??
        readHeader(req.headers['x-vercel-forwarded-for']) ??
        null,
      xForwardedFor: firstForwardedIp(req.headers['x-forwarded-for']),
      xRealIp: readHeader(req.headers['x-real-ip']) ?? null,
    },
    vercelGeoCountry: readHeader(req.headers['x-vercel-ip-country']) ?? null,
    vercelGeoRegion:
      readHeader(req.headers['x-vercel-ip-country-region']) ?? null,
    vercelGeoCity: readHeader(req.headers['x-vercel-ip-city']) ?? null,
  };
}

export function beginPublicPost(
  req: VercelRequest,
  res: VercelResponse,
  rateKeyPrefix: string,
): boolean {
  if (!applyCors(req, res)) {
    return false;
  }

  if (rejectIfOriginBlocked(req, res)) {
    return false;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).json({ error: 'Method not allowed', code: 'method_not_allowed' });
    return false;
  }

  const { rateLimitPerMin } = getServerEnv();
  pruneRateLimitBuckets();
  const ip = clientIp(req);
  const { limited, retryAfterSec } = isRateLimited(
    `${rateKeyPrefix}:${ip}`,
    rateLimitPerMin,
  );

  if (limited) {
    res.setHeader('Retry-After', String(retryAfterSec));
    res.status(429).json({ error: 'Too many requests', code: 'rate_limited' });
    return false;
  }

  return true;
}

export { readHeader } from './headers.js';
