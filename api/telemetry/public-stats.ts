import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors, rejectIfOriginBlocked } from '../_lib/cors.js';
import { getServerEnv } from '../_lib/env.js';
import { getServiceClient } from '../_lib/supabase.js';

/**
 * Public aggregate stats only — no IPs, session IDs, or visitor records.
 * Same-origin portfolio widget + allowlisted Origins may read this.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (!applyCors(req, res)) {
    return;
  }

  if (rejectIfOriginBlocked(req, res)) {
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    res.status(405).json({ error: 'Method not allowed', code: 'method_not_allowed' });
    return;
  }

  try {
    const { inactiveMs } = getServerEnv();
    const supabase = getServiceClient();
    const cutoff = new Date(Date.now() - inactiveMs).toISOString();

    const [analyticsResult, activeResult] = await Promise.all([
      supabase
        .from('page_analytics')
        .select('total_views, total_downloads')
        .eq('id', 1)
        .maybeSingle(),
      supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .gt('last_active_at', cutoff),
    ]);

    if (analyticsResult.error) {
      res.status(503).json({
        error: 'Analytics table unavailable',
        code: 'supabase_analytics_unavailable',
        detail: analyticsResult.error.message,
      });
      return;
    }

    if (activeResult.error) {
      res.status(503).json({
        error: 'Session stats unavailable',
        code: 'supabase_sessions_unavailable',
        detail: activeResult.error.message,
      });
      return;
    }

    const row = analyticsResult.data as {
      total_views?: number;
      total_downloads?: number;
    } | null;

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      ok: true,
      totalViews: Number(row?.total_views ?? 0) || 0,
      totalDownloads: Number(row?.total_downloads ?? 0) || 0,
      activeNow: activeResult.count ?? 0,
      source: 'vercel-service-role',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const code = message.includes('Missing required environment variable')
      ? 'supabase_env_missing'
      : 'supabase_connectivity_failure';

    res.status(503).json({
      error: 'Could not load public telemetry stats',
      code,
      detail: message,
    });
  }
}
