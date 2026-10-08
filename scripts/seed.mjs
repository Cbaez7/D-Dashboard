import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
for (const line of envFile.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const [, , email, password, displayName = "Chris", orgName = "BNG Worldwide Chauffeur Services"] =
  process.argv;

if (!email || !password) {
  console.error("usage: node scripts/seed.mjs <email> <password> [displayName] [orgName]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !serviceKey || !anonKey) {
  console.error("missing Supabase env vars in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { display_name: displayName },
});

let userId = created?.user?.id;
if (createErr) {
  if (/already|exists|registered/i.test(createErr.message)) {
    const { data: list } = await admin.auth.admin.listUsers();
    userId = list?.users?.find((u) => u.email === email)?.id;
    if (!userId) throw createErr;
    console.log("user already exists:", userId);
  } else {
    throw createErr;
  }
} else {
  console.log("created auth user:", userId);
}

const userClient = createClient(url, anonKey, { auth: { persistSession: false } });
const { error: signInErr } = await userClient.auth.signInWithPassword({ email, password });
if (signInErr) throw signInErr;

const { data: existing, error: existErr } = await userClient
  .from("org_members")
  .select("org_id, role")
  .eq("user_id", userId);
if (existErr) throw existErr;

if (existing?.length) {
  console.log("membership already exists, skipping create_org:", existing);
} else {
  const { data: orgId, error: orgErr } = await userClient.rpc("create_org", { p_name: orgName });
  if (orgErr) throw orgErr;
  console.log("created org:", orgId);
}

const { data: membership, error: memErr } = await userClient
  .from("org_members")
  .select("org_id, role")
  .eq("user_id", userId);
if (memErr) throw memErr;
console.log("membership:", membership);

const { data: org } = await userClient.from("orgs").select("id, name");
console.log("visible orgs:", org);
console.log("seed complete");
