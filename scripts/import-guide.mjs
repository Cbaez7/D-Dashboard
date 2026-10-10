import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
for (const line of envFile.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const email = process.argv[2] ?? "cbaez@bnglimo.com";
const filePath =
  process.argv[3] ?? "C:/Users/emper/Downloads/BNG_Guide_v15_11.html";

const { data: users } = await admin.auth.admin.listUsers();
const user = users?.users?.find((u) => u.email === email);
const { data: membership } = await admin
  .from("org_members")
  .select("org_id")
  .eq("user_id", user.id)
  .single();
const orgId = membership.org_id;

const html = readFileSync(filePath, "utf8");

const REFERENCE = new Set([
  "corporate-rates",
  "affiliate-rates",
  "walkin-rates",
  "driver-rates",
  "zone-reference",
  "glossary",
  "chris-notes",
  "onenote-airports",
  "onenote-hourly-minimums",
  "onenote-bus-farmouts",
  "onenote-farmin-affiliates",
  "onenote-global-farmout",
]);

const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}-\u{2BFF}\u{FE0F}\u{200D}]/gu;

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#\d+;/g, (m) => String.fromCodePoint(Number(m.slice(2, -1))));

const stripEmoji = (s) => s.replace(EMOJI, "").replace(/[^\S\n]+/g, " ");

function sectionToText(inner) {
  let s = inner;
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/<div class="quick-nav">[\s\S]*?<\/div>\s*<\/div>/g, "");
  s = s.replace(/<div class="download-section">[\s\S]*?<\/div>/g, "");
  s = s.replace(/<script[\s\S]*?<\/script>/g, "");
  s = s.replace(/<style[\s\S]*?<\/style>/g, "");
  s = s.replace(/<div class="card-title">([\s\S]*?)<\/div>/g, "\n\n## $1\n");
  s = s.replace(/<div class="rate-card-name">([\s\S]*?)<\/div>/g, "\n\n### $1\n");
  s = s.replace(/<div class="quick-nav-title">([\s\S]*?)<\/div>/g, "");
  s = s.replace(
    /<div class="alert[^"]*">([\s\S]*?)<\/div>/g,
    (_, body) => `\n\n> ${body.replace(/<[^>]+>/g, " ").trim()}\n`,
  );
  s = s.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/g, (_, row) => {
    const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map(
      (c) => c[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    );
    return cells.length ? `\n${cells.join(" | ")}` : "";
  });
  s = s.replace(/<li[^>]*>/g, "\n- ");
  s = s.replace(/<\/(ul|ol|table|thead|tbody|div|p|h[1-6]|blockquote)>/g, "\n");
  s = s.replace(/<br\s*\/?>/g, "\n");
  s = s.replace(/<span class="tag[^"]*">([\s\S]*?)<\/span>/g, "[$1]");
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/g, "**$1**");
  s = s.replace(/<[^>]+>/g, " ");
  s = decode(s);
  s = stripEmoji(s);
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

const sections = [];
const re = /<section class="section" id="([^"]+)">([\s\S]*?)(?=<section class="section" id=|<\/main>|$)/g;
let m;
while ((m = re.exec(html))) {
  const [, id, block] = m;
  const titleMatch = block.match(/<h2 class="section-title">([\s\S]*?)<\/h2>/);
  if (!titleMatch) continue;
  const title = decode(stripEmoji(titleMatch[1].replace(/<[^>]+>/g, " "))).trim();
  const body = sectionToText(
    block.slice(block.indexOf("</h2>")).replace(/<\/section>[\s\S]*/s, ""),
  );
  sections.push({ id, title, body });
}

console.log(`parsed ${sections.length} sections`);
for (const s of sections) console.log(`  ${s.id}: ${s.title} (${s.body.length} chars)`);

const rows = sections.map((s, i) => ({
  org_id: orgId,
  slug: s.id,
  title: s.title,
  category: REFERENCE.has(s.id) ? "Reference" : "Operations",
  body: s.body,
  version: 1,
  requires_ack: true,
  position: i,
  published: true,
  created_by: user.id,
}));

const { error } = await admin
  .from("sop_pages")
  .upsert(rows, { onConflict: "org_id,slug" });
if (error) throw error;
console.log(`upserted ${rows.length} sop_pages`);
