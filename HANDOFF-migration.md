# BNG Desk — Handoff: Apply channel-policy recursion fix

**Prepared:** October 8, 2026 — for the Supabase-capable agent. One task; report result back.

## Context

- Supabase project: **`bng-desk`**, ref `jxvrujexuiahynrswrxz`, org `developers-9705's projects`, `ACTIVE_HEALTHY`.
- Do not touch the unrelated `svtxxqoxdwohfmxccjke` (NetWorth) project.

## Problem being fixed

Three live RLS policies recurse infinitely:

- `channels_select` checks `channel_members` for DM membership
- `channel_members_select` checks `channels` for org membership
- `messages_select` / `messages_insert` check `channel_members`

Every authenticated query on `channels`, `channel_members`, or `messages` fails with `infinite recursion detected in policy for relation "channels"` (SQLSTATE `42P17`).

## Task

Run `supabase/migrations/20261008_fix_channel_policy_recursion.sql` against the project via `apply_migration` (the file is committed in repo `Cbaez7/D-Dash` and on disk at `C:\Users\emper\bng-desk\supabase\migrations\20261008_fix_channel_policy_recursion.sql`).

It is one transaction that:

1. Creates `public.is_channel_member(uuid)` — `SECURITY DEFINER`, `stable`, `set search_path = ''`, returns whether `auth.uid()` has a row in `channel_members`. Because it runs as the function owner, it bypasses RLS evaluation and breaks the policy cycle — same pattern as the existing `is_org_member` / `is_org_admin` / `current_org_id` helpers.
2. `revoke all ... from public` + `grant execute ... to authenticated` (matches other helpers).
3. Drops and recreates `channels_select`, `messages_select`, `messages_insert` — the only change being the inline `exists (select ... channel_members ...)` replaced with `public.is_channel_member(...)`.

The DROP POLICY statements may trigger a destructive-operation confirmation — approve it: policies are objects, not data; the replacements are created in the same transaction.

## Verify after applying

```sql
-- policy + function state
select proname from pg_proc where proname = 'is_channel_member';
select tablename, policyname from pg_policies
where tablename in ('channels','channel_members','messages') order by 1, 2;
```

Then, **as an authenticated user** (not service role), confirm no recursion — e.g. via PostgREST/JS client or `set local role authenticated` in a transaction:

```sql
set local role authenticated;
set local request.jwt.claim.sub = '57cc98a1-471e-4ebd-a83f-27f86bc8a96d';
select id, kind, name from public.channels;
```

Expected: zero rows (not an error). The app auto-creates `#dispatch`/`#ops`/`#general` on first chat load, so empty is correct.

## Report back

- Migration applied? Any errors verbatim.
- The verify output (function exists, policies listed, authenticated select returns without 42P17).
