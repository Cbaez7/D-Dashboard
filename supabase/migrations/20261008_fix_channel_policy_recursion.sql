begin;

create or replace function public.is_channel_member(p_channel_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.channel_members
    where channel_id = p_channel_id and user_id = (select auth.uid())
  )
$$;

revoke all on function public.is_channel_member(uuid) from public;
grant execute on function public.is_channel_member(uuid) to authenticated;

drop policy if exists channels_select on public.channels;
create policy channels_select on public.channels for select to authenticated
  using (
    public.is_org_member(org_id)
    and (kind <> 'dm' or public.is_channel_member(id))
  );

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages for select to authenticated
  using (
    public.is_org_member(org_id)
    and public.is_channel_member(messages.channel_id)
  );

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert to authenticated
  with check (
    public.is_org_member(org_id)
    and author_id = (select auth.uid())
    and public.is_channel_member(messages.channel_id)
  );

commit;
