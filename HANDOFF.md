# BNG Desk — Handoff: Seed + Vercel Deploy

**Prepared:** October 8, 2026 — for the Supabase-capable agent. **Return values expected at the end.**

## Context

- App: **BNG Desk** — Next.js 16 + React 19 + Tailwind 4 internal dispatch console.
- Working repo: `C:\Users\emper\bng-desk` (GitHub `Cbaez7/D-Dash`, branch `main`, deploy remote already pushed).
- Supabase project: **`bng-desk`**, ref `jxvrujexuiahynrswrxz`, org `developers-9705's projects`, region `us-east-1`, `ACTIVE_HEALTHY`.
- Schema applied: 34 public tables, all RLS, 106 policies, buckets `avatars`/`documents`/`document-uploads`, `supabase_realtime` carries `messages, notifications, drivers, trips, clock_entries, tasks, shifts`.
- `org_members` INSERT is admin-only; org bootstrap = `public.create_org(name)` (SECURITY DEFINER, authenticated only — `anon` EXECUTE explicitly revoked).
- Credentials (real values): `C:\Users\emper\.codex\visualizations\2026\10\08\01a11b46-3bdd-76f2-a969-33a7740a301b\bng-desk.env.local` — already copied verbatim to `C:\Users\emper\bng-desk\.env.local` (gitignored).

## Task 1 — Seed the first user + org

Run from `C:\Users\emper\bng-desk`:

```powershell
node scripts/seed.mjs cbaez@bnglimo.com "<password>"
```

Password: read `C:\Users\emper\.bng-desk-seed-password.txt` (a generated 32-char secret). Read the file and pass its contents as the arg — do not display or log it. Optional 3rd/4th args: display name (default `Chris`), org name (default `BNG Worldwide Chauffeur Services`).

The script: creates the auth user via admin API (`email_confirm: true`), signs in as that user, calls `rpc('create_org')`, prints membership. **Expected:** one auth user, one org, one `admin` row in `org_members`. If the user already exists it reuses it; safe to rerun.

Verify afterward (read-only):

```sql
select u.email, o.name as org, m.role
from auth.users u
join public.org_members m on m.user_id = u.id
join public.orgs o on o.id = m.org_id;
```

Expect exactly one row: `cbaez@bnglimo.com | BNG Worldwide Chauffeur Services | admin`.

## Task 2 — Vercel deploy

1. Create a Vercel project linked to GitHub repo **`Cbaez7/D-Dash`** (production branch `main`). Standard Next.js detection — no build overrides needed. If the agent's Vercel tooling needs a team ID and none is available, tell the user to import at vercel.com instead (2 minutes) and skip to step 3.
2. Set env vars (all environments):

| Name | Value source |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jxvrujexuiahynrswrxz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from the credentials file |
| `SUPABASE_SERVICE_ROLE_KEY` | from the credentials file — **server-only** |

3. Trigger/await the first deployment and confirm it builds (`npm run build` passes locally — green as of commit `c84f607`).

## Task 3 — Report back

- Seed result (user id, org id, role) + the verification query output
- Vercel project URL + deployment URL/status
- Any errors verbatim

## Do NOT

- Create a new Supabase project (free-tier limit is hit; this one was deliberately reused)
- Rerun `supabase/schema.sql` (policies aren't idempotent — targeted changes only)
- Create a `bng_realtime` publication (correct publication is `supabase_realtime`)
- Commit `.env.local` or print the service-role key
- Touch the unrelated `svtxxqoxdwohfmxccjke` (NetWorth) project
