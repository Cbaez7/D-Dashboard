# Conventions

The build rules for this repo. Follow them for every component, section, and page.

## 1. Typography comes first

The type scale lives in `app/globals.css` under `@layer base`: `h1`–`h6`, `p`, `.lead-style`, `.caption-style`, `.eyebrow-style`. Check the design's values against it and update globals if they don't match — never add per-component font styles to `p`, `h1`–`h3`. Use the semantic classes (`lead-style`, `caption-style`, `eyebrow-style`) for non-heading text.

## 2. Components

- Section structure: a `section` with `flex min-h-0 min-w-0 flex-1 flex-col`, header row on top, scrollable content below. Match `components/dispatch/dispatch.tsx` for new surfaces.
- Always use the `Button` component for buttons and always pass an explicit `variant` (`primary`, `secondary`, `muted`, `subtle`, `ghost`, `nav`, `item`, `link`).
- UI primitives live in `components/_ui` — use them instead of hand-rolling (dialog, sheet, popover, tabs, table, select, input, tag, command, scroll-area).
- Shared chrome lives in `components/_common` (sidebar, app-header, notifications, profile, command menu).
- Feature surfaces live in `components/<surface>/` (dispatch, livemap, inbox, calls, chat, quote, guide, clock, admin).

## 3. Styling

- Tailwind only — no CSS modules, no styled components, no inline `style` for layout.
- `em` for max-widths on headings and paragraphs: `max-width = px / font-size` in `em`.
- Use the `divide` utilities for borders between stacked items; `outline`/border tokens (`--border`, `--line-strong`) for separations.
- Design tokens are CSS vars in `:root` mapped into `@theme` — use the semantic classes (`bg-card`, `text-subtle`, `border-line-strong`) not raw hex.

## 4. Motion

- Shared GSAP power easings are exposed as Tailwind utilities (`ease-power1..4-in/out/in-out`, `ease-smooth-in-out`) — use them for transitions instead of ad-hoc curves. Keep durations ~150–200ms for UI feedback.

## 5. Assets & icons

- Every image/video/Rive/Lottie goes through the `Asset` component (`components/_ui/asset`), typed by `type`, with `width`/`height` as the aspect ratio.
- Icons are exported SVG components imported from `public/assets/images/**` via SVGR (`icon: true` in `next.config.ts`) — no icon libraries. New icons: 14×14 viewBox, `stroke="currentColor"`, `stroke-width="1.4"`, round caps — match `public/assets/images/nav/`.

## 6. Data & state

- Zustand stores in `stores/` for client state; server data flows through server components/actions and Supabase.
- All org data carries `org_id`; RLS enforces org scope — never query with the service key from client code. `SUPABASE_SERVICE_ROLE_KEY` is server-only (`lib/supabase/admin.ts`).

## 7. SEO

`lib/seo.ts` holds `SITE_NAME`, `SITE_URL`, `SITE_DESCRIPTION`, `SITE_ROUTES` — `robots.ts`, `sitemap.ts`, `llms.txt` and page metadata derive from them. `NEXT_PUBLIC_SITE_URL` overrides the URL per deploy.

## 8. Misc

- No comments in code — name things well instead.
- `data/` holds fixtures/mock shapes only while a surface awaits its backend.
- Accessibility: real labels on interactive elements, `aria-hidden` on decorative icons, focus-visible rings preserved.
