import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllowedOrigins } from './env.js';
import { readHeader } from './headers.js';

function resolveAllowedOrigin(origin: string | undefined): string | null {
  if (!origin) {
    return null;
  }

  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.length === 0) {
    // Dev-friendly default when unset: echo request origin.
    return origin;
  }

  return allowedOrigins.includes(origin) ? origin : null;
}

export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = readHeader(req.headers.origin);
  const allowed = resolveAllowedOrigin(origin);

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', allowed);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false;
  }

  return true;
}

export function rejectIfOriginBlocked(
  req: VercelRequest,
  res: VercelResponse,
): boolean {
  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.length === 0) {
    return false;
  }

  const origin = readHeader(req.headers.origin);

  if (!origin || !allowedOrigins.includes(origin)) {
    res.status(403).json({ error: 'Origin not allowed' });
    return true;
  }

  return false;
}
