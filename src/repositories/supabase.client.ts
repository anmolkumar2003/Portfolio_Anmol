import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { resolveSupabaseUrl } from '../../shared/supabase-url';

let browserClient: SupabaseClient | null = null;

function supabaseUrl(): string {
  return resolveSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
}

function supabaseAnonKey(): string {
  return import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (browserClient) {
    return browserClient;
  }

  browserClient = createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
