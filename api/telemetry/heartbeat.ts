import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getServerEnv } from '../_lib/env.js';
import { beginPublicPost } from '../_lib/request.js';
import { getServiceClient } from '../_lib/supabase.js';
import { heartbeatPayloadSchema, parseJsonBody } from '../_lib/validate.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (!beginPublicPost(req, res, 'heartbeat')) {
    return;
  }

  const parsed = heartbeatPayloadSchema.safeParse(parseJsonBody(req.body));
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  const { inactiveMs } = getServerEnv();
  const supabase = getServiceClient();

  await supabase.rpc('mark_stale_sessions_inactive', {
    p_threshold_ms: inactiveMs,
  });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('sessions')
    .update({
      is_active: true,
      last_active_at: now,
      ended_at: null,
    })
    .eq('session_key', parsed.data.sessionKey)
    .select('id')
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: 'Failed to update heartbeat' });
    return;
  }

  if (!data) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.status(200).json({ ok: true });
}
