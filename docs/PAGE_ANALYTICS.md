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

Ensure these are set (same free Supabase project):

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 3. Behavior

- On homepage load: fetch counters + `increment_counter('views')`
- Resume download click: `increment_counter('downloads')`
- Presence: join `telemetry-room` and show concurrent online count
- IP via `api.ipify.org` with graceful “blocked / n/a” fallback
