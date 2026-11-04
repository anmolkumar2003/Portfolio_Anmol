-- Visitor telemetry schema for real-time session monitoring.
-- Apply in the Supabase SQL editor or via the Supabase CLI.
-- Writes go through Vercel serverless functions using the service role.
-- Frontend reads use the anon key + authenticated admin RLS.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  visitor_key text not null unique,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint visitors_visitor_key_format check (char_length(visitor_key) between 8 and 128)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  session_key text not null unique,
  visitor_id uuid not null references public.visitors (id) on delete cascade,

  is_active boolean not null default true,
  started_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  ended_at timestamptz,

  browser_name text,
  browser_engine text,
  device_category text,
  os_name text,
  screen_width integer,
  screen_height integer,
  timezone text,

  ip_address inet,
  geo_country text,
  geo_region text,
  geo_city text,
  geo_postal_code text,
  isp_name text,
  network_org text,

  user_agent text,

  created_at timestamptz not null default now(),

  constraint sessions_session_key_format check (char_length(session_key) between 8 and 128),
  constraint sessions_device_category_check check (
    device_category is null
    or device_category in ('desktop', 'mobile', 'tablet', 'unknown')
  ),
  constraint sessions_screen_width_check check (
    screen_width is null or (screen_width > 0 and screen_width <= 16384)
  ),
  constraint sessions_screen_height_check check (
    screen_height is null or (screen_height > 0 and screen_height <= 16384)
  )
);

create index if not exists sessions_active_idx
  on public.sessions (is_active, last_active_at desc);

create index if not exists sessions_started_idx
  on public.sessions (started_at desc);

create index if not exists sessions_visitor_id_idx
  on public.sessions (visitor_id);

create table if not exists public.watchers (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users (id) on delete cascade,
  watcher_key text not null,
  last_seen_at timestamptz not null default now(),
  constraint watchers_watcher_key_format check (char_length(watcher_key) between 8 and 128),
  constraint watchers_admin_watcher_unique unique (admin_user_id, watcher_key)
);

create index if not exists watchers_last_seen_idx
  on public.watchers (last_seen_at desc);

create table if not exists public.telemetry_meta (
  key text primary key,
  value_timestamptz timestamptz,
  value_json jsonb,
  updated_at timestamptz not null default now()
);

insert into public.telemetry_meta (key, value_timestamptz)
values ('tracking_started_at', now())
on conflict (key) do nothing;

create table if not exists public.admin_allowlist (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_telemetry_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_allowlist
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_telemetry_admin() from public;
grant execute on function public.is_telemetry_admin() to authenticated;

create or replace function public.mark_stale_sessions_inactive(p_threshold_ms integer default 300000)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.sessions
  set
    is_active = false,
    ended_at = coalesce(ended_at, last_active_at)
  where is_active = true
    and last_active_at < (now() - make_interval(secs => greatest(p_threshold_ms, 1000) / 1000.0));

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke all on function public.mark_stale_sessions_inactive(integer) from public;
grant execute on function public.mark_stale_sessions_inactive(integer) to service_role;

create or replace function public.purge_stale_watchers(p_threshold_ms integer default 120000)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.watchers
  where last_seen_at < (now() - make_interval(secs => greatest(p_threshold_ms, 1000) / 1000.0));

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.purge_stale_watchers(integer) from public;
grant execute on function public.purge_stale_watchers(integer) to service_role;

-- Optional retention helper for IP/geo fields (call from a scheduled job).
create or replace function public.scrub_session_ip_data(p_retention_days integer default 30)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.sessions
  set
    ip_address = null,
    isp_name = null,
    network_org = null
  where started_at < (now() - make_interval(days => greatest(p_retention_days, 1)))
    and ip_address is not null;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke all on function public.scrub_session_ip_data(integer) from public;
grant execute on function public.scrub_session_ip_data(integer) to service_role;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.visitors enable row level security;
alter table public.sessions enable row level security;
alter table public.watchers enable row level security;
alter table public.telemetry_meta enable row level security;
alter table public.admin_allowlist enable row level security;

drop policy if exists visitors_admin_select on public.visitors;
create policy visitors_admin_select
  on public.visitors
  for select
  to authenticated
  using (public.is_telemetry_admin());

drop policy if exists sessions_admin_select on public.sessions;
create policy sessions_admin_select
  on public.sessions
  for select
  to authenticated
  using (public.is_telemetry_admin());

drop policy if exists watchers_admin_select on public.watchers;
create policy watchers_admin_select
  on public.watchers
  for select
  to authenticated
  using (public.is_telemetry_admin());

drop policy if exists watchers_admin_delete_own on public.watchers;
create policy watchers_admin_delete_own
  on public.watchers
  for delete
  to authenticated
  using (public.is_telemetry_admin() and admin_user_id = auth.uid());

drop policy if exists telemetry_meta_admin_select on public.telemetry_meta;
create policy telemetry_meta_admin_select
  on public.telemetry_meta
  for select
  to authenticated
  using (public.is_telemetry_admin());

drop policy if exists admin_allowlist_self_select on public.admin_allowlist;
create policy admin_allowlist_self_select
  on public.admin_allowlist
  for select
  to authenticated
  using (user_id = auth.uid());

-- No anon policies: public clients cannot read or write tables directly.
-- Service role bypasses RLS for ingestion endpoints.

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter table public.sessions replica identity full;
alter table public.watchers replica identity full;
alter table public.visitors replica identity full;
alter table public.telemetry_meta replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.sessions;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.watchers;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.visitors;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.telemetry_meta;
  exception
    when duplicate_object then null;
  end;
end $$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

grant select on public.visitors to authenticated;
grant select on public.sessions to authenticated;
grant select, delete on public.watchers to authenticated;
grant select on public.telemetry_meta to authenticated;
grant select on public.admin_allowlist to authenticated;

grant all on public.visitors to service_role;
grant all on public.sessions to service_role;
grant all on public.watchers to service_role;
grant all on public.telemetry_meta to service_role;
grant all on public.admin_allowlist to service_role;

-- After creating your Supabase Auth user, allowlist them:
-- insert into public.admin_allowlist (user_id, email)
-- values ('<auth-user-uuid>', 'you@example.com');
