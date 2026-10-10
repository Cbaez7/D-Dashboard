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
if (!url || !serviceKey) {
  console.error("missing Supabase env vars in .env.local");
  process.exit(1);
}

const email = process.argv[2] ?? "cbaez@bnglimo.com";
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const { data: users } = await admin.auth.admin.listUsers();
const user = users?.users?.find((u) => u.email === email);
if (!user) {
  console.error(`no auth user for ${email} — run scripts/seed.mjs first`);
  process.exit(1);
}

const { data: membership, error: memErr } = await admin
  .from("org_members")
  .select("org_id")
  .eq("user_id", user.id)
  .single();
if (memErr || !membership) {
  console.error("no org membership — run scripts/seed.mjs first");
  process.exit(1);
}
const orgId = membership.org_id;
console.log(`org: ${orgId}  user: ${user.id} (${email})`);

async function seedIfEmpty(table, label, rows, filterCol, filterVal) {
  let query = admin.from(table).select("id", { count: "exact", head: true });
  if (filterCol) query = query.eq(filterCol, filterVal);
  const { count, error } = await query;
  if (error) throw error;
  if (count > 0) {
    console.log(`${label}: ${count} row(s) already exist, skipping`);
    return;
  }
  const { error: insErr } = await admin.from(table).insert(rows);
  if (insErr) throw insErr;
  console.log(`${label}: inserted ${rows.length}`);
}

const today = new Date().toISOString().slice(0, 10);

await seedIfEmpty("shifts", "shift", [
  {
    org_id: orgId,
    user_id: user.id,
    days_of_week: [1, 2, 3, 4, 5],
    start_time: "14:30",
    end_time: "22:30",
    tz: "America/Los_Angeles",
    effective_from: today,
    service_type: "standard",
    acknowledged_at: new Date().toISOString(),
    created_by: user.id,
  },
], "user_id", user.id);

await seedIfEmpty("vehicles", "vehicles", [
  { org_id: orgId, name: "Vehicle 08", plate: "8BNK120", capacity: 3, type: "Sedan", status: "active" },
  { org_id: orgId, name: "Vehicle 12", plate: "8BNK330", capacity: 6, type: "SUV", status: "active" },
  { org_id: orgId, name: "Vehicle 15", plate: "8BNK415", capacity: 10, type: "Sprinter", status: "maintenance", notes: "Brake service due Friday" },
], "org_id", orgId);

await seedIfEmpty("tasks", "tasks", [
  {
    org_id: orgId,
    title: "Confirm LAX pickup staging plan for morning bank",
    notes: "Terminals 4–6 arrivals between 06:00–09:00. Verify chauffeur staging zones.",
    priority: "high",
    assignee_id: user.id,
    created_by: user.id,
    status: "open",
  },
  {
    org_id: orgId,
    title: "Review Vehicle 15 maintenance ETA",
    notes: "Back in service before Friday evening airport runs.",
    priority: "normal",
    assignee_id: user.id,
    created_by: user.id,
    status: "in_progress",
  },
  {
    org_id: orgId,
    title: "Update corporate account rate card — One Gold",
    priority: "low",
    created_by: user.id,
    status: "open",
  },
], "org_id", orgId);

const sops = [
  {
    slug: "airport-pickup-procedure",
    title: "Airport pickup procedure",
    category: "Dispatch",
    body: [
      "## Before dispatch",
      "",
      "1. Confirm the chauffeur has the client's mobile number and flight number.",
      "2. Check flight status 30 minutes before wheels-down; note tail number changes on charters.",
      "3. Stage in the holding lot — never idle at the curb.",
      "",
      "## On arrival",
      "",
      "1. Text the client when the flight lands: name sign location, vehicle description, plate.",
      "2. Curbside pickup requires the client at the curb — otherwise route to livery staging.",
      "3. Log actual pickup time against the trip for the report.",
    ].join("\n"),
  },
  {
    slug: "quote-and-booking-standards",
    title: "Quote and booking standards",
    category: "Sales",
    body: [
      "## Quoting",
      "",
      "- Always quote from the desk quoter — never estimate verbally.",
      "- Corporate accounts bill at their negotiated rate card; verify the account before quoting.",
      "- Tolls, parking, and gratuity are itemized in the breakdown, not bundled.",
      "",
      "## After sending",
      "",
      "- Save every quote to history, sent or not.",
      "- A quote does not create a reservation — booking confirmation is a separate step.",
    ].join("\n"),
  },
  {
    slug: "missed-handoff-protocol",
    title: "Missed handoff protocol",
    category: "Operations",
    body: [
      "If a dispatch handoff is missed (trip not acknowledged 15 minutes after assignment):",
      "",
      "1. Call the chauffeur directly — do not wait for a callback.",
      "2. Escalate to the shift lead if unreachable in 5 minutes.",
      "3. Document the miss in the trip thread with timestamps.",
      "4. Repeat misses in a week go to admin review.",
    ].join("\n"),
  },
];

const { data: existingSops } = await admin
  .from("sop_pages")
  .select("slug")
  .eq("org_id", orgId);
const existingSlugs = new Set((existingSops ?? []).map((row) => row.slug));
const newSops = sops
  .filter((sop) => !existingSlugs.has(sop.slug))
  .map((sop, index) => ({
    org_id: orgId,
    ...sop,
    position: index + 1,
    requires_ack: true,
    published: true,
    created_by: user.id,
  }));
if (newSops.length) {
  const { error } = await admin.from("sop_pages").insert(newSops);
  if (error) throw error;
  console.log(`sop_pages: inserted ${newSops.length}`);
} else {
  console.log("sop_pages: all slugs exist, skipping");
}

await seedIfEmpty("notifications", "notifications", [
  {
    org_id: orgId,
    user_id: user.id,
    kind: "task",
    title: "Task assigned — Confirm LAX pickup staging plan",
    body: "Due before the morning arrivals bank.",
    surface: "dispatch",
  },
  {
    org_id: orgId,
    user_id: user.id,
    kind: "system",
    title: "Welcome to BNG Desk",
    body: "Chat, Clock, Guide and Tasks are live. Dispatch integrations are next.",
    surface: "admin",
  },
], "user_id", user.id);

const integrationKeys = ["limoanywhere", "graph", "3cx", "maps", "flights"];
const { data: existingInt } = await admin
  .from("integration_state")
  .select("key")
  .eq("org_id", orgId);
const missing = integrationKeys.filter(
  (key) => !(existingInt ?? []).some((row) => row.key === key),
);
if (missing.length) {
  const { error } = await admin.from("integration_state").insert(
    missing.map((key) => ({ org_id: orgId, key, status: "pending" })),
  );
  if (error) throw error;
  console.log(`integration_state: inserted ${missing.length}`);
} else {
  console.log("integration_state: all keys exist, skipping");
}

const accountsData = JSON.parse(
  readFileSync(resolve(process.cwd(), "lib/quote/accounts.json"), "utf8"),
);
const accountRows = Object.entries(accountsData).map(([name, notes]) => ({
  org_id: orgId,
  name,
  notes,
}));
const { error: accErr } = await admin
  .from("corporate_accounts")
  .upsert(accountRows, { onConflict: "org_id,name" });
if (accErr) throw accErr;
console.log(`accounts: upserted ${accountRows.length}`);

await seedIfEmpty("clients", "clients", [
  {
    org_id: orgId,
    name: "Elena Vargas",
    email: "elena.vargas@example.com",
    phone: "+1 (415) 555-0142",
    company: "Veeam",
    vip: true,
    tags: ["corporate", "frequent"],
    notes:
      "Prefers quiet ride, no radio. Usually SFO arrivals — gate code required at dropoff.",
  },
  {
    org_id: orgId,
    name: "Marcus Chen",
    email: "marcus.chen@asana.com",
    phone: "+1 (650) 555-0187",
    company: "Asana",
    vip: false,
    tags: ["corporate"],
    notes: "",
  },
  {
    org_id: orgId,
    name: "Priya Raman",
    email: "priya@example.org",
    vip: false,
    tags: ["walk-in"],
    notes: "",
  },
]);

const { data: elena } = await admin
  .from("clients")
  .select("id")
  .eq("org_id", orgId)
  .eq("email", "elena.vargas@example.com")
  .maybeSingle();

if (elena) {
  const veeam = await admin
    .from("corporate_accounts")
    .select("id")
    .eq("org_id", orgId)
    .eq("name", "Veeam & NetJets")
    .maybeSingle();
  if (veeam.data) {
    await admin
      .from("clients")
      .update({ account_id: veeam.data.id })
      .eq("id", elena.id);
  }

  await seedIfEmpty("client_addresses", "client_addresses", [
    {
      org_id: orgId,
      client_id: elena.id,
      label: "Home",
      address: "1240 Broadway St, San Francisco, CA 94109",
    },
    {
      org_id: orgId,
      client_id: elena.id,
      label: "Office",
      address: "400 Concar Dr, San Mateo, CA 94402",
    },
  ], "client_id", elena.id);

  await seedIfEmpty("client_notes", "client_notes", [
    {
      org_id: orgId,
      client_id: elena.id,
      author_id: user.id,
      body: "Rebooked for the quarterly board meeting — always asks for the same chauffeur if available.",
    },
  ], "client_id", elena.id);

  const { count: quoteCount } = await admin
    .from("quotes")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("customer_email", "elena.vargas@example.com");
  if (!quoteCount) {
    const { error: quoteErr } = await admin.from("quotes").insert({
      org_id: orgId,
      created_by: user.id,
      customer_name: "Elena Vargas",
      customer_email: "elena.vargas@example.com",
      trip_type: "Airport",
      vehicle: "Sedan",
      pickup: { city: "San Francisco" },
      dropoff: { city: "SFO" },
      breakdown: { seeded: true, note: "Sample quote for CRM timeline" },
      total_cents: 18500,
      status: "accepted",
    });
    if (quoteErr) throw quoteErr;
    console.log("quotes: seeded sample quote for Elena Vargas");
  }
}

console.log("content seed complete");
