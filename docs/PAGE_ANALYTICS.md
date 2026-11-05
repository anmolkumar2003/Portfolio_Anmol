# Page Analytics (Realtime Telemetry)

## 1. Apply SQL

Run `supabase/migrations/002_page_analytics.sql` in the Supabase SQL editor.

This creates:

- `page_analytics` singleton table (`total_views`, `total_downloads`)
- `increment_counter(metric text)` RPC for atomic increments
- Public `SELECT` RLS for anon/authenticated
- Optional Realtime publication for counter updates

Presence channel `telemetry-room` is client-side only (no table).

## 2. Frontend env

Ensure these are set (same free Supabase project) in **local `.env` and Vercel**:

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

Vite bakes `VITE_*` into the production bundle at **build time**. A one-character typo in `VITE_SUPABASE_URL` on Vercel will make the Live HUD show unavailable counters with a connection error.

The app also corrects a known historical typo (`dqbikcikjrr…` → `dqbikcikirr…`) at runtime — still fix the Vercel env to the correct host so future builds stay clean.

Also set server secrets for session ingest + `/api/telemetry/public-stats`:

```bash
SUPABASE_URL=https://<same-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
ALLOWED_ORIGINS=https://anmolios.vercel.app,http://localhost:5173
```

`ALLOWED_ORIGINS` is merged with `VERCEL_URL` / `VERCEL_PROJECT_PRODUCTION_URL` automatically. Same-deployment Origin is also trusted.

## 3. Behavior

- On homepage load: fetch counters + `increment_counter('views')` (refetch if RPC returns empty body)
- Fallback: `GET /api/telemetry/public-stats` (aggregates only; no IPs)
- Resume download click: `increment_counter('downloads')`
- Presence: join `telemetry-room` for concurrent Active Now; poll public-stats as fallback
- Public Live widget never displays visitor IPs (admin dashboard only)
- Admin `/admin/telemetry` → **Verify my IP** compares server-detected IP vs this browser’s public IP

## 4. Privacy

Public responses and the Live HUD expose **aggregates only** (views, downloads, active count, plus the viewer’s own browser/OS/language labels). Individual IPs, ISP, geo, and session identifiers stay behind authenticated admin RLS + `/api/telemetry/whoami`.
