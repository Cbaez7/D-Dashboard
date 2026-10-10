begin;

create table public.corporate_accounts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs on delete cascade,
  name text not null,
  notes text not null default '',
  billing_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, name)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs on delete cascade,
  account_id uuid references public.corporate_accounts on delete set null,
  name text not null,
  email text,
  phone text,
  company text,
  vip boolean not null default false,
  tags text[] not null default '{}',
  notes text not null default '',
  preferences jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_org_idx on public.clients (org_id, name);
create index clients_email_idx on public.clients (org_id, email);

create table public.client_addresses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs on delete cascade,
  client_id uuid not null references public.clients on delete cascade,
  label text not null default 'Address',
  address text not null,
  created_at timestamptz not null default now()
);

create index client_addresses_client_idx on public.client_addresses (client_id);

create table public.client_notes (
  id bigint generated always as identity primary key,
  org_id uuid not null references public.orgs on delete cascade,
  client_id uuid not null references public.clients on delete cascade,
  author_id uuid references auth.users on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index client_notes_client_idx on public.client_notes (client_id, created_at);

alter table public.corporate_accounts enable row level security;
alter table public.clients enable row level security;
alter table public.client_addresses enable row level security;
alter table public.client_notes enable row level security;

create policy corporate_accounts_select on public.corporate_accounts for select to authenticated
  using (public.is_org_member(org_id));
create policy corporate_accounts_admin_insert on public.corporate_accounts for insert to authenticated
  with check (public.is_org_admin(org_id));
create policy corporate_accounts_admin_update on public.corporate_accounts for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));
create policy corporate_accounts_admin_delete on public.corporate_accounts for delete to authenticated
  using (public.is_org_admin(org_id));

create policy clients_select on public.clients for select to authenticated
  using (public.is_org_member(org_id));
create policy clients_insert on public.clients for insert to authenticated
  with check (public.is_org_member(org_id));
create policy clients_update on public.clients for update to authenticated
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));
create policy clients_admin_delete on public.clients for delete to authenticated
  using (public.is_org_admin(org_id));

create policy client_addresses_select on public.client_addresses for select to authenticated
  using (public.is_org_member(org_id));
create policy client_addresses_insert on public.client_addresses for insert to authenticated
  with check (public.is_org_member(org_id));
create policy client_addresses_update on public.client_addresses for update to authenticated
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));
create policy client_addresses_delete on public.client_addresses for delete to authenticated
  using (public.is_org_member(org_id));

create policy client_notes_select on public.client_notes for select to authenticated
  using (public.is_org_member(org_id));
create policy client_notes_insert on public.client_notes for insert to authenticated
  with check (public.is_org_member(org_id) and author_id = (select auth.uid()));
create policy client_notes_update on public.client_notes for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));
create policy client_notes_delete on public.client_notes for delete to authenticated
  using (public.is_org_admin(org_id) or author_id = (select auth.uid()));

alter publication supabase_realtime add table public.clients;
alter publication supabase_realtime add table public.client_notes;
alter publication supabase_realtime add table public.corporate_accounts;

commit;
