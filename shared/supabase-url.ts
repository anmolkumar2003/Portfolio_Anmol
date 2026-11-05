/**
 * Correct a known one-character typo previously baked into Vercel
 * (`…kjrr…` → `…kirr…`). Safe no-op when the URL is already correct.
 */
const KNOWN_TYPO_HOST = 'dqbikcikjrrciqxxumte.supabase.co';
const CORRECT_HOST = 'dqbikcikirrciqxxumte.supabase.co';

export function resolveSupabaseUrl(raw: string | undefined | null): string {
  const value = raw?.trim() ?? '';
  if (!value) {
    return '';
  }

  return value.split(KNOWN_TYPO_HOST).join(CORRECT_HOST);
}
