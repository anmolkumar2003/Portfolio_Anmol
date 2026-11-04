import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from './env.js';

let serviceClient: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (serviceClient) {
    return serviceClient;
  }

  const { supabaseUrl, supabaseServiceRoleKey } = getServerEnv();
  serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serviceClient;
}

export async function requireAdminUserId(
  authorizationHeader: string | string[] | undefined,
): Promise<{ userId: string } | { error: string; status: number }> {
  const header = Array.isArray(authorizationHeader)
    ? authorizationHeader[0]
    : authorizationHeader;

  if (!header?.startsWith('Bearer ')) {
    return { error: 'Missing bearer token', status: 401 };
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return { error: 'Missing bearer token', status: 401 };
  }

  const client = getServiceClient();
  const { data, error } = await client.auth.getUser(token);

  if (error || !data.user) {
    return { error: 'Invalid session', status: 401 };
  }

  const { data: allowlist, error: allowlistError } = await client
    .from('admin_allowlist')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (allowlistError) {
    return { error: 'Authorization check failed', status: 500 };
  }

  if (!allowlist) {
    return { error: 'Forbidden', status: 403 };
  }

  return { userId: data.user.id };
}
