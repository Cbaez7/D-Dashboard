# BNG Desk

Dispatch ops console for BNG — trips, map, inbox, calls, chat, quoting, SOPs and clock-in in one Next.js app. Built on the Kargul starter (Next.js 16 + React 19 + Tailwind CSS 4). Read `CONVENTIONS.md` before writing any component, section, or page — it is the whole spec for how this repo is built.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script                 | What it does                                                       |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run dev`          | Start the dev server                                               |
| `npm run build`        | Production build                                                   |
| `npm run start`        | Serve the production build                                         |
| `npm run lint`         | ESLint                                                             |

## Environment

Copy `.env.local.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — the Supabase project
- `GRAPH_*` — Microsoft 365 app for the shared dispatch mailbox
- `LIMO_API_*` — LimoAnywhere API (read-only mirror)
- `CX3_WEBHOOK_SECRET` — secret on the 3CX CRM-URL webhook route
- `FLIGHTAWARE_KEY`, `NEXT_PUBLIC_MAP_TILES_URL`

Without Supabase env vars the app runs unauthenticated (dev mode). Apply `supabase/schema.sql` to a fresh project to provision the database.

## Docs

| File               | What's in it                                                        |
| ------------------ | ------------------------------------------------------------------- |
| `CONVENTIONS.md`   | The build rules. Read first.                                        |
| `AGENTS.md`        | Next.js version notes for agents                                    |
| `.builderrules`    | Quick rules (same content, terser)                                  |
