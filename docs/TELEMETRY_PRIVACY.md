# Visitor telemetry — privacy notes

This portfolio can record **first-party visitor sessions** for a private administrator dashboard. It is not advertising tracking and does not use browser fingerprinting.

## What is collected

| Data | Source | Purpose |
|------|--------|---------|
| Random session ID | `sessionStorage` | Tie heartbeats to one browser tab session |
| Random visitor ID | `localStorage` | Approximate unique visitor counts across visits |
| Browser name / engine | User-Agent parse (client) | Session diagnostics |
| OS / device category | User-Agent + viewport heuristics | Session diagnostics |
| Screen width × height | `window.screen` | Session diagnostics |
| Timezone | `Intl` | Session diagnostics |
| Truncated user agent | Navigator | Debugging only |
| IP address | Server request headers | Approx. location / abuse resistance (admin-only) |
| Country / region / city / postal | Vercel geo headers and/or optional IP intelligence API | Approx. location |
| ISP / network org | Optional IP intelligence provider | Network context when available |
| Timestamps | Server clock | Session start, last active, end |

## What is not collected

- Account emails or contact form contents for telemetry
- Canvas / WebGL / audio / font fingerprinting
- Cross-site trackers for this feature
- Claims that a visitor ID equals a unique physical device

Visitor IDs are **privacy-conscious, first-party random identifiers**. Counts labeled “approximate unique visitors” must never be described as unique devices.

## Consent and legal basis

Before enabling telemetry in production:

1. Confirm a lawful basis under applicable law (e.g. legitimate interest for security/operations, or consent where required).
2. Update the public privacy notice to describe session monitoring, IP processing, retention, and how to request deletion.
3. Restrict IP display to authenticated administrators only (enforced by Supabase Auth + allowlist RLS).

## Access control

- Ingestion uses Vercel serverless functions with the Supabase **service role** (server-only).
- The browser receives only the Supabase **anon** key.
- Dashboard reads require an authenticated user listed in `admin_allowlist`.
- Row Level Security denies anonymous table access.
- The public Live widget and `/api/telemetry/public-stats` return **aggregates only** (no IPs, session IDs, or visitor rows).
- Admin IP verification (`/api/telemetry/whoami`) is allowlisted-auth only.

## Retention and deletion

- Default recommendation: scrub `ip_address`, `isp_name`, and `network_org` after **30 days** via `scrub_session_ip_data(30)`.
- Full session rows may be deleted manually or with a scheduled job as needed.
- To delete a visitor’s approximate identity, remove matching `visitors` rows (cascades sessions) after correlating `visitor_key` if a deletion request is received.

## Rate limiting and abuse protection

- Public ingest endpoints validate payloads and apply per-IP rate limits.
- Configure `ALLOWED_ORIGINS` to the production site origin(s).
- Optional IP intelligence calls are server-side only and skipped when `IP_INTEL_PROVIDER=none`.

## Operator setup checklist

1. Apply `supabase/migrations/001_visitor_telemetry.sql`.
2. Create a Supabase Auth user for the administrator.
3. Insert that user into `admin_allowlist`.
4. Set Vercel env vars from `.env.example` (never expose the service role key to Vite).
5. Open `/admin/telemetry`, sign in, and confirm empty real stats (zeros) before any traffic.
