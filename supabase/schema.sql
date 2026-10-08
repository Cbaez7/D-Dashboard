create extension if not exists pgcrypto;

create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists org_members (
  org_id uuid not null references orgs on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'dispatcher' check (role in ('admin', 'dispatcher')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.org_members
    where org_id = p_org_id and user_id = (select auth.uid())
  )
$$;

create or replace function public.is_org_admin(p_org_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.org_members
    where org_id = p_org_id and user_id = (select auth.uid()) and role = 'admin'
  )
$$;

create or replace function public.current_org_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select org_id from public.org_members
  where user_id = (select auth.uid())
  order by created_at limit 1
$$;

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.is_org_admin(uuid) from public;
revoke all on function public.current_org_id() from public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;
grant execute on function public.current_org_id() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists audit_events (
  id bigint generated always as identity primary key,
  org_id uuid not null references orgs on delete cascade,
  actor_id uuid references auth.users on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  kind text not null default 'channel' check (kind in ('channel', 'dm', 'trip')),
  name text,
  topic text,
  trip_id text,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists channel_members (
  channel_id uuid not null references channels on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (channel_id, user_id)
);

create table if not exists messages (
  id bigint generated always as identity primary key,
  org_id uuid not null references orgs on delete cascade,
  channel_id uuid not null references channels on delete cascade,
  author_id uuid references auth.users on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  title text not null,
  notes text,
  assignee_id uuid references auth.users on delete set null,
  created_by uuid references auth.users on delete set null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  due_at timestamptz,
  trip_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clock_entries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  clock_in_at timestamptz not null default now(),
  clock_out_at timestamptz,
  edited_by uuid references auth.users on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists sop_pages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  title text not null,
  slug text not null,
  category text,
  body text not null default '',
  position int not null default 0,
  published boolean not null default true,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, slug)
);

create table if not exists sop_revisions (
  id bigint generated always as identity primary key,
  page_id uuid not null references sop_pages on delete cascade,
  body text not null,
  edited_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists rate_tables (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  name text not null,
  kind text not null check (kind in ('zone', 'hourly', 'vehicle', 'fee', 'premium')),
  payload jsonb not null default '{}',
  updated_by uuid references auth.users on delete set null,
  updated_at timestamptz not null default now(),
  unique (org_id, name, kind)
);

create table if not exists zones (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  name text not null,
  polygon jsonb,
  color text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  created_by uuid references auth.users on delete set null,
  customer_name text,
  customer_email text,
  customer_phone text,
  trip_type text,
  vehicle text,
  pickup jsonb,
  dropoff jsonb,
  breakdown jsonb not null default '{}',
  total_cents int,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'expired')),
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  name text not null,
  plate text,
  capacity int,
  type text,
  status text not null default 'active' check (status in ('active', 'maintenance', 'out')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists fleet_notes (
  id bigint generated always as identity primary key,
  org_id uuid not null references orgs on delete cascade,
  vehicle_id uuid not null references vehicles on delete cascade,
  note text not null,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists customer_notes (
  id bigint generated always as identity primary key,
  org_id uuid not null references orgs on delete cascade,
  account_ref text,
  customer_name text not null,
  vip boolean not null default false,
  note text not null,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id bigint generated always as identity primary key,
  org_id uuid not null references orgs on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  kind text not null,
  title text not null,
  body text,
  surface text,
  ref jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists notification_prefs (
  user_id uuid primary key references auth.users on delete cascade,
  prefs jsonb not null default '{}'
);

create table if not exists integration_state (
  org_id uuid not null references orgs on delete cascade,
  key text not null,
  config jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'ok', 'error')),
  last_sync_at timestamptz,
  error text,
  updated_at timestamptz not null default now(),
  primary key (org_id, key)
);

create table if not exists email_trip_links (
  id bigint generated always as identity primary key,
  org_id uuid not null references orgs on delete cascade,
  graph_conversation_id text not null,
  trip_id text not null,
  linked_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now(),
  unique (org_id, graph_conversation_id, trip_id)
);

create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  la_id text not null,
  name text not null,
  phone text,
  status text,
  lat double precision,
  lng double precision,
  position_at timestamptz,
  vehicle_label text,
  raw jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique (org_id, la_id)
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  la_id text not null,
  status text,
  pickup_at timestamptz,
  pickup jsonb,
  dropoff jsonb,
  passenger jsonb,
  account_ref text,
  driver_la_id text,
  vehicle_label text,
  raw jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique (org_id, la_id)
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  la_id text not null,
  name text not null,
  phone text,
  email text,
  vip boolean not null default false,
  raw jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique (org_id, la_id)
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs on delete cascade,
  la_id text not null,
  account_ref text,
  status text,
  total_cents int,
  issued_at timestamptz,
  paid_at timestamptz,
  raw jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique (org_id, la_id)
);

create table if not exists webhook_events (
  id bigint generated always as identity primary key,
  org_id uuid references orgs on delete cascade,
  source text not null,
  payload jsonb not null default '{}',
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists org_members_user_idx on org_members (user_id);
create index if not exists channel_members_user_idx on channel_members (user_id);
create index if not exists messages_channel_idx on messages (channel_id, created_at);
create index if not exists tasks_org_idx on tasks (org_id, status);
create index if not exists tasks_assignee_idx on tasks (assignee_id) where assignee_id is not null;
create index if not exists clock_entries_user_idx on clock_entries (org_id, user_id, clock_in_at);
create index if not exists shifts_user_idx on shifts (org_id, user_id, starts_at);
create index if not exists sop_pages_org_idx on sop_pages (org_id, category, position);
create index if not exists quotes_org_idx on quotes (org_id, created_at);
create index if not exists notifications_user_idx on notifications (user_id, read_at);
create index if not exists audit_events_org_idx on audit_events (org_id, created_at);
create index if not exists trips_org_idx on trips (org_id, pickup_at);
create index if not exists invoices_org_idx on invoices (org_id, issued_at);
create index if not exists webhook_events_source_idx on webhook_events (source, received_at);

alter table orgs enable row level security;
alter table profiles enable row level security;
alter table org_members enable row level security;
alter table audit_events enable row level security;
alter table channels enable row level security;
alter table channel_members enable row level security;
alter table messages enable row level security;
alter table tasks enable row level security;
alter table clock_entries enable row level security;
alter table shifts enable row level security;
alter table sop_pages enable row level security;
alter table sop_revisions enable row level security;
alter table rate_tables enable row level security;
alter table zones enable row level security;
alter table quotes enable row level security;
alter table vehicles enable row level security;
alter table fleet_notes enable row level security;
alter table customer_notes enable row level security;
alter table notifications enable row level security;
alter table notification_prefs enable row level security;
alter table integration_state enable row level security;
alter table email_trip_links enable row level security;
alter table drivers enable row level security;
alter table trips enable row level security;
alter table accounts enable row level security;
alter table invoices enable row level security;
alter table webhook_events enable row level security;

create policy orgs_select on orgs for select to authenticated
  using (public.is_org_member(id));

create policy profiles_select on profiles for select to authenticated
  using (
    (select auth.uid()) = id
    or exists (
      select 1 from org_members me
      join org_members other on other.org_id = me.org_id
      where me.user_id = (select auth.uid()) and other.user_id = profiles.id
    )
  );

create policy profiles_update on profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy org_members_select on org_members for select to authenticated
  using (public.is_org_member(org_id));

create policy org_members_admin_insert on org_members for insert to authenticated
  with check (public.is_org_admin(org_id) or user_id = (select auth.uid()));

create policy org_members_admin_update on org_members for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy org_members_admin_delete on org_members for delete to authenticated
  using (public.is_org_admin(org_id) and user_id <> (select auth.uid()));

create policy audit_events_select on audit_events for select to authenticated
  using (public.is_org_admin(org_id));

create policy audit_events_insert on audit_events for insert to authenticated
  with check (public.is_org_member(org_id) and actor_id = (select auth.uid()));

create policy channels_select on channels for select to authenticated
  using (
    public.is_org_member(org_id)
    and (
      kind <> 'dm'
      or exists (
        select 1 from channel_members cm
        where cm.channel_id = channels.id and cm.user_id = (select auth.uid())
      )
    )
  );

create policy channels_insert on channels for insert to authenticated
  with check (public.is_org_member(org_id) and created_by = (select auth.uid()));

create policy channels_update on channels for update to authenticated
  using (public.is_org_admin(org_id) or created_by = (select auth.uid()))
  with check (public.is_org_member(org_id));

create policy channels_delete on channels for delete to authenticated
  using (public.is_org_admin(org_id) or created_by = (select auth.uid()));

create policy channel_members_select on channel_members for select to authenticated
  using (
    exists (
      select 1 from channels c
      where c.id = channel_members.channel_id and public.is_org_member(c.org_id)
    )
  );

create policy channel_members_insert on channel_members for insert to authenticated
  with check (
    user_id = (select auth.uid())
    or exists (
      select 1 from channels c
      where c.id = channel_members.channel_id and public.is_org_admin(c.org_id)
    )
  );

create policy channel_members_delete on channel_members for delete to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from channels c
      where c.id = channel_members.channel_id and public.is_org_admin(c.org_id)
    )
  );

create policy channel_members_update on channel_members for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy messages_select on messages for select to authenticated
  using (
    public.is_org_member(org_id)
    and exists (
      select 1 from channel_members cm
      where cm.channel_id = messages.channel_id and cm.user_id = (select auth.uid())
    )
  );

create policy messages_insert on messages for insert to authenticated
  with check (
    public.is_org_member(org_id)
    and author_id = (select auth.uid())
    and exists (
      select 1 from channel_members cm
      where cm.channel_id = messages.channel_id and cm.user_id = (select auth.uid())
    )
  );

create policy messages_update on messages for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy messages_delete on messages for delete to authenticated
  using (author_id = (select auth.uid()) or public.is_org_admin(org_id));

create policy tasks_select on tasks for select to authenticated
  using (public.is_org_member(org_id));

create policy tasks_insert on tasks for insert to authenticated
  with check (public.is_org_member(org_id) and created_by = (select auth.uid()));

create policy tasks_update on tasks for update to authenticated
  using (
    public.is_org_admin(org_id)
    or assignee_id = (select auth.uid())
    or created_by = (select auth.uid())
  )
  with check (public.is_org_member(org_id));

create policy tasks_delete on tasks for delete to authenticated
  using (public.is_org_admin(org_id) or created_by = (select auth.uid()));

create policy clock_entries_select on clock_entries for select to authenticated
  using (
    public.is_org_member(org_id)
    and (user_id = (select auth.uid()) or public.is_org_admin(org_id))
  );

create policy clock_entries_insert on clock_entries for insert to authenticated
  with check (public.is_org_member(org_id) and user_id = (select auth.uid()));

create policy clock_entries_update on clock_entries for update to authenticated
  using (public.is_org_member(org_id) and (user_id = (select auth.uid()) or public.is_org_admin(org_id)))
  with check (public.is_org_member(org_id) and (user_id = (select auth.uid()) or public.is_org_admin(org_id)));

create policy clock_entries_delete on clock_entries for delete to authenticated
  using (public.is_org_admin(org_id));

create policy shifts_select on shifts for select to authenticated
  using (public.is_org_member(org_id));

create policy shifts_admin_write on shifts for insert to authenticated
  with check (public.is_org_admin(org_id));

create policy shifts_admin_update on shifts for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy shifts_admin_delete on shifts for delete to authenticated
  using (public.is_org_admin(org_id));

create policy sop_pages_select on sop_pages for select to authenticated
  using (public.is_org_member(org_id) and (published or public.is_org_admin(org_id)));

create policy sop_pages_admin_insert on sop_pages for insert to authenticated
  with check (public.is_org_admin(org_id));

create policy sop_pages_admin_update on sop_pages for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy sop_pages_admin_delete on sop_pages for delete to authenticated
  using (public.is_org_admin(org_id));

create policy sop_revisions_select on sop_revisions for select to authenticated
  using (
    exists (
      select 1 from sop_pages p
      where p.id = sop_revisions.page_id and public.is_org_member(p.org_id)
    )
  );

create policy sop_revisions_admin_insert on sop_revisions for insert to authenticated
  with check (
    exists (
      select 1 from sop_pages p
      where p.id = sop_revisions.page_id and public.is_org_admin(p.org_id)
    )
  );

create policy rate_tables_select on rate_tables for select to authenticated
  using (public.is_org_member(org_id));

create policy rate_tables_admin_insert on rate_tables for insert to authenticated
  with check (public.is_org_admin(org_id));

create policy rate_tables_admin_update on rate_tables for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy rate_tables_admin_delete on rate_tables for delete to authenticated
  using (public.is_org_admin(org_id));

create policy zones_select on zones for select to authenticated
  using (public.is_org_member(org_id));

create policy zones_admin_insert on zones for insert to authenticated
  with check (public.is_org_admin(org_id));

create policy zones_admin_update on zones for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy zones_admin_delete on zones for delete to authenticated
  using (public.is_org_admin(org_id));

create policy quotes_select on quotes for select to authenticated
  using (public.is_org_member(org_id));

create policy quotes_insert on quotes for insert to authenticated
  with check (public.is_org_member(org_id) and created_by = (select auth.uid()));

create policy quotes_update on quotes for update to authenticated
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

create policy quotes_delete on quotes for delete to authenticated
  using (public.is_org_admin(org_id) or created_by = (select auth.uid()));

create policy vehicles_select on vehicles for select to authenticated
  using (public.is_org_member(org_id));

create policy vehicles_admin_insert on vehicles for insert to authenticated
  with check (public.is_org_admin(org_id));

create policy vehicles_admin_update on vehicles for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy vehicles_admin_delete on vehicles for delete to authenticated
  using (public.is_org_admin(org_id));

create policy fleet_notes_select on fleet_notes for select to authenticated
  using (public.is_org_member(org_id));

create policy fleet_notes_insert on fleet_notes for insert to authenticated
  with check (public.is_org_member(org_id) and created_by = (select auth.uid()));

create policy fleet_notes_delete on fleet_notes for delete to authenticated
  using (created_by = (select auth.uid()) or public.is_org_admin(org_id));

create policy customer_notes_select on customer_notes for select to authenticated
  using (public.is_org_member(org_id));

create policy customer_notes_insert on customer_notes for insert to authenticated
  with check (public.is_org_member(org_id) and created_by = (select auth.uid()));

create policy customer_notes_update on customer_notes for update to authenticated
  using (created_by = (select auth.uid()) or public.is_org_admin(org_id))
  with check (public.is_org_member(org_id));

create policy customer_notes_delete on customer_notes for delete to authenticated
  using (created_by = (select auth.uid()) or public.is_org_admin(org_id));

create policy notifications_select on notifications for select to authenticated
  using (user_id = (select auth.uid()));

create policy notifications_update on notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy notifications_insert on notifications for insert to authenticated
  with check (public.is_org_member(org_id));

create policy notifications_delete on notifications for delete to authenticated
  using (user_id = (select auth.uid()));

create policy notification_prefs_select on notification_prefs for select to authenticated
  using (user_id = (select auth.uid()));

create policy notification_prefs_upsert on notification_prefs for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy notification_prefs_update on notification_prefs for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy integration_state_select on integration_state for select to authenticated
  using (public.is_org_member(org_id));

create policy integration_state_admin_insert on integration_state for insert to authenticated
  with check (public.is_org_admin(org_id));

create policy integration_state_admin_update on integration_state for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy email_trip_links_select on email_trip_links for select to authenticated
  using (public.is_org_member(org_id));

create policy email_trip_links_insert on email_trip_links for insert to authenticated
  with check (public.is_org_member(org_id) and linked_by = (select auth.uid()));

create policy email_trip_links_delete on email_trip_links for delete to authenticated
  using (linked_by = (select auth.uid()) or public.is_org_admin(org_id));

create policy drivers_select on drivers for select to authenticated
  using (public.is_org_member(org_id));

create policy drivers_admin_update on drivers for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy trips_select on trips for select to authenticated
  using (public.is_org_member(org_id));

create policy accounts_select on accounts for select to authenticated
  using (public.is_org_member(org_id));

create policy invoices_select on invoices for select to authenticated
  using (public.is_org_member(org_id));

create policy webhook_events_select on webhook_events for select to authenticated
  using (org_id is null or public.is_org_admin(org_id));

drop trigger if exists set_tasks_updated_at on tasks;
create trigger set_tasks_updated_at before update on tasks
  for each row execute function public.set_updated_at();

drop trigger if exists set_sop_pages_updated_at on sop_pages;
create trigger set_sop_pages_updated_at before update on sop_pages
  for each row execute function public.set_updated_at();

drop trigger if exists set_rate_tables_updated_at on rate_tables;
create trigger set_rate_tables_updated_at before update on rate_tables
  for each row execute function public.set_updated_at();

drop trigger if exists set_integration_state_updated_at on integration_state;
create trigger set_integration_state_updated_at before update on integration_state
  for each row execute function public.set_updated_at();

drop trigger if exists set_drivers_updated_at on drivers;
create trigger set_drivers_updated_at before update on drivers
  for each row execute function public.set_updated_at();

drop trigger if exists set_trips_updated_at on trips;
create trigger set_trips_updated_at before update on trips
  for each row execute function public.set_updated_at();

drop trigger if exists set_accounts_updated_at on accounts;
create trigger set_accounts_updated_at before update on accounts
  for each row execute function public.set_updated_at();

drop trigger if exists set_invoices_updated_at on invoices;
create trigger set_invoices_updated_at before update on invoices
  for each row execute function public.set_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table notifications;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'drivers'
  ) then
    alter publication supabase_realtime add table drivers;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'trips'
  ) then
    alter publication supabase_realtime add table trips;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'clock_entries'
  ) then
    alter publication supabase_realtime add table clock_entries;
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy avatars_read on storage.objects for select to authenticated
  using (bucket_id = 'avatars');

create policy avatars_write on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
