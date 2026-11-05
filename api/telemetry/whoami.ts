import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from '../_lib/cors.js';
import { clientIpDiagnostics } from '../_lib/request.js';
import { requireAdminUserId } from '../_lib/supabase.js';

/**
 * Admin-only IP verification. Returns the server-detected client IP for the
 * authenticated caller so they can compare it with their own public IP.
 * Never exposed on the public portfolio widget.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (!applyCors(req, res)) {
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.status(405).json({ error: 'Method not allowed', code: 'method_not_allowed' });
    return;
  }

  const auth = await requireAdminUserId(req.headers.authorization);
  if ('error' in auth) {
    res.status(auth.status).json({ error: auth.error, code: 'auth_failed' });
    return;
  }

  const diagnostics = clientIpDiagnostics(req);

  res.status(200).json({
    ok: true,
    serverDetectedIp: diagnostics.clientIp,
    headers: diagnostics.headers,
    vercelGeo: {
      country: diagnostics.vercelGeoCountry,
      region: diagnostics.vercelGeoRegion,
      city: diagnostics.vercelGeoCity,
    },
    note: 'Compare serverDetectedIp with a trusted public-IP check in this admin session only.',
  });
}
