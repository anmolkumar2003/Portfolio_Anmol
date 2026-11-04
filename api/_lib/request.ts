import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors, rejectIfOriginBlocked } from './cors.js';
import { getServerEnv } from './env.js';
import { readHeader } from './headers.js';
import { isRateLimited, pruneRateLimitBuckets } from './rate-limit.js';

export function clientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() || 'unknown';
  }

  const realIp = readHeader(req.headers['x-real-ip']);
  if (realIp) {
    return realIp;
  }

  return req.socket.remoteAddress ?? 'unknown';
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
    res.status(405).json({ error: 'Method not allowed' });
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
    res.status(429).json({ error: 'Too many requests' });
    return false;
  }

  return true;
}

export { readHeader } from './headers.js';
