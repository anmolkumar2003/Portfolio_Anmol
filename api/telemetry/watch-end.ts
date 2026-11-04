import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from '../_lib/cors.js';
import { getServiceClient, requireAdminUserId } from '../_lib/supabase.js';
import { parseJsonBody, watchPayloadSchema } from '../_lib/validate.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (!applyCors(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const auth = await requireAdminUserId(req.headers.authorization);
  if ('error' in auth) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const parsed = watchPayloadSchema.safeParse(parseJsonBody(req.body));
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from('watchers')
    .delete()
    .eq('admin_user_id', auth.userId)
    .eq('watcher_key', parsed.data.watcherKey);

  if (error) {
    res.status(500).json({ error: 'Failed to end watcher' });
    return;
  }

  res.status(200).json({ ok: true });
}
