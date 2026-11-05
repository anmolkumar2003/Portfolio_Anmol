import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllowedOrigins } from './env.js';
import { readHeader } from './headers.js';

function normalizeOrigin(origin: string): string | null {
  try {
    const url = new URL(origin);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

function hostFromRequest(req: VercelRequest): string | null {
  const forwardedHost = readHeader(req.headers['x-forwarded-host']);
  if (forwardedHost) {
    return forwardedHost.split(',')[0]?.trim() || null;
  }

  return readHeader(req.headers.host) ?? null;
}

/** True when the browser Origin matches this deployment host (same-origin POST/beacon). */
export function isSameDeploymentOrigin(
  req: VercelRequest,
  origin: string | undefined,
): boolean {
  if (!origin) {
    return false;
  }

  const normalized = normalizeOrigin(origin);
  const host = hostFromRequest(req);
  if (!normalized || !host) {
    return false;
  }

  try {
    return new URL(normalized).host === host;
  } catch {
    return false;
  }
}

/**
 * Beacons and some same-origin posts omit Origin. Trust only when Sec-Fetch-Site
 * reports same-origin (or "none" for user-driven top-level navigations).
 */
export function isTrustedOriginlessSameSite(req: VercelRequest): boolean {
  if (readHeader(req.headers.origin)) {
    return false;
  }

  const fetchSite = readHeader(req.headers['sec-fetch-site'])?.toLowerCase();
  return fetchSite === 'same-origin' || fetchSite === 'none';
}

function resolveAllowedOrigin(req: VercelRequest): string | null {
  const origin = readHeader(req.headers.origin);
  if (!origin) {
    return null;
  }

  const normalized = normalizeOrigin(origin);
  if (!normalized) {
    return null;
  }

  if (isSameDeploymentOrigin(req, normalized)) {
    return normalized;
  }

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.length === 0) {
    // Dev-friendly default when unset: echo request origin.
    return normalized;
  }

  return allowedOrigins.includes(normalized) ? normalized : null;
}

export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const allowed = resolveAllowedOrigin(req);

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', allowed);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
  if (isTrustedOriginlessSameSite(req)) {
    return false;
  }

  const origin = readHeader(req.headers.origin);
  const normalized = origin ? normalizeOrigin(origin) : null;

  if (normalized && isSameDeploymentOrigin(req, normalized)) {
    return false;
  }

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.length === 0) {
    // Unset allowlist: echo-any mode (local/dev). Still require an Origin when present.
    return false;
  }

  if (!normalized || !allowedOrigins.includes(normalized)) {
    res.status(403).json({
      error: 'Origin not allowed',
      code: 'cors_origin_rejected',
    });
    return true;
  }

  return false;
}
