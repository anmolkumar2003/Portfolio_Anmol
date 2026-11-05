-- Page analytics counters + atomic increment RPC.
-- Apply in the Supabase SQL editor (or via supabase db push).
--
-- After applying:
-- 1. Confirm Realtime is enabled for the project (Dashboard → Database → Replication).
-- 2. Presence channel `telemetry-room` is client-only (no table required).
-- 3. Frontend uses the anon key to SELECT page_analytics and CALL increment_counter.

-- ---------------------------------------------------------------------------
-- Singleton metrics row
-- ---------------------------------------------------------------------------

create table if not exists public.page_analytics (
  id smallint primary key default 1 check (id = 1),
  total_views bigint not null default 0 check (total_views >= 0),
  total_downloads bigint not null default 0 check (total_downloads >= 0),
  updated_at timestamptz not null default now()
);

insert into public.page_analytics (id, total_views, total_downloads)
values (1, 0, 0)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Atomic counter RPC
-- metric: 'views' | 'downloads' (also accepts 'total_views' / 'total_downloads')
-- ---------------------------------------------------------------------------

create or replace function public.increment_counter(metric text)
returns table (
  total_views bigint,
  total_downloads bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := lower(trim(coalesce(metric, '')));
begin
  if normalized in ('views', 'total_views', 'view') then
    update public.page_analytics
    set
      total_views = public.page_analytics.total_views + 1,
      updated_at = now()
    where id = 1;
  elsif normalized in ('downloads', 'total_downloads', 'download') then
    update public.page_analytics
    set
      total_downloads = public.page_analytics.total_downloads + 1,
      updated_at = now()
    where id = 1;
  else
    raise exception 'Unsupported metric: %', metric
      using errcode = '22023';
  end if;

  return query
  select pa.total_views, pa.total_downloads
  from public.page_analytics as pa
  where pa.id = 1;
end;
$$;

revoke all on function public.increment_counter(text) from public;
grant execute on function public.increment_counter(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS — public read of aggregate counters; writes only via RPC
-- ---------------------------------------------------------------------------

alter table public.page_analytics enable row level security;

drop policy if exists page_analytics_select_public on public.page_analytics;
create policy page_analytics_select_public
  on public.page_analytics
  for select
  to anon, authenticated
  using (true);

-- No INSERT/UPDATE/DELETE policies for anon — mutations go through increment_counter.

grant select on table public.page_analytics to anon, authenticated;

-- Optional: stream counter updates to subscribed clients (safe if already added)
do $$
begin
  alter publication supabase_realtime add table public.page_analytics;
exception
  when duplicate_object then
    null;
  when undefined_object then
    raise notice 'Realtime publication unavailable — enable Realtime in the Supabase dashboard.';
end;
$$;
