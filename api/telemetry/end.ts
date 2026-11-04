import type { VercelRequest, VercelResponse } from '@vercel/node';
import { beginPublicPost } from '../_lib/request';
import { getServiceClient } from '../_lib/supabase';
import { endPayloadSchema, parseJsonBody } from '../_lib/validate';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (!beginPublicPost(req, res, 'end')) {
    return;
  }

  const parsed = endPayloadSchema.safeParse(parseJsonBody(req.body));
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  const supabase = getServiceClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('sessions')
    .update({
      is_active: false,
      last_active_at: now,
      ended_at: now,
    })
    .eq('session_key', parsed.data.sessionKey);

  if (error) {
    res.status(500).json({ error: 'Failed to end session' });
    return;
  }

  res.status(200).json({ ok: true });
}
