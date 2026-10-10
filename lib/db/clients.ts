import { createClient } from "@/lib/supabase/client";
import { fetchProfileNames } from "@/lib/db/org";
import type { SavedQuote } from "@/lib/db/quotes";

export type Account = {
  id: string;
  name: string;
  notes: string;
  billingEmail: string | null;
};

export type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  vip: boolean;
  tags: string[];
  notes: string;
  preferences: Record<string, unknown>;
  accountId: string | null;
  accountName: string | null;
  createdAt: string;
};

export type ClientAddress = {
  id: string;
  label: string;
  address: string;
};

export type ClientNote = {
  id: number;
  author: string;
  body: string;
  createdAt: string;
};

export type TimelineItem = {
  id: string;
  kind: "note" | "quote" | "trip" | "call" | "email";
  createdAt: string;
  title: string;
  body?: string;
  meta?: string;
};

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  vip: boolean;
  tags: string[];
  notes: string;
  preferences: Record<string, unknown>;
  account_id: string | null;
  created_at: string;
  accounts: { name: string } | { name: string }[] | null;
};

function mapClient(row: ClientRow): Client {
  const account = Array.isArray(row.accounts) ? row.accounts[0] : row.accounts;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    vip: row.vip,
    tags: row.tags ?? [],
    notes: row.notes,
    preferences: row.preferences ?? {},
    accountId: row.account_id,
    accountName: account?.name ?? null,
    createdAt: row.created_at,
  };
}

const CLIENT_SELECT =
  "id, name, email, phone, company, vip, tags, notes, preferences, account_id, created_at, accounts(name)";

export async function fetchClients(orgId: string): Promise<Client[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clients")
    .select(CLIENT_SELECT)
    .eq("org_id", orgId)
    .order("name", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as ClientRow[]).map(mapClient);
}

export async function fetchAccounts(orgId: string): Promise<Account[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("id, name, notes, billing_email")
    .eq("org_id", orgId)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    notes: row.notes,
    billingEmail: row.billing_email,
  }));
}

export type ClientDetail = {
  client: Client;
  addresses: ClientAddress[];
  notes: ClientNote[];
  quotes: SavedQuote[];
};

export async function fetchClientDetail(clientId: string, email: string | null): Promise<ClientDetail> {
  const supabase = createClient();
  const [clientRes, addressesRes, notesRes] = await Promise.all([
    supabase.from("clients").select(CLIENT_SELECT).eq("id", clientId).single(),
    supabase
      .from("client_addresses")
      .select("id, label, address")
      .eq("client_id", clientId)
      .order("created_at"),
    supabase
      .from("client_notes")
      .select("id, author_id, body, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
  ]);
  if (clientRes.error) throw clientRes.error;
  if (addressesRes.error) throw addressesRes.error;
  if (notesRes.error) throw notesRes.error;

  let quotes: SavedQuote[] = [];
  if (email) {
    const { data: quoteRows, error: quoteErr } = await supabase
      .from("quotes")
      .select(
        "id, customer_name, customer_email, customer_phone, trip_type, vehicle, pickup, dropoff, breakdown, total_cents, status, emailed_at, created_at",
      )
      .eq("customer_email", email)
      .order("created_at", { ascending: false })
      .limit(20);
    if (quoteErr) throw quoteErr;
    quotes = (quoteRows ?? []).map((row) => ({
      id: row.id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      tripType: row.trip_type,
      vehicle: row.vehicle,
      pickup: row.pickup,
      dropoff: row.dropoff,
      breakdown: row.breakdown as SavedQuote["breakdown"],
      totalCents: row.total_cents,
      status: row.status,
      emailedAt: row.emailed_at,
      createdAt: row.created_at,
    }));
  }

  const names = await fetchProfileNames();
  return {
    client: mapClient(clientRes.data as unknown as ClientRow),
    addresses: addressesRes.data ?? [],
    notes: (notesRes.data ?? []).map((row) => ({
      id: row.id,
      author: row.author_id ? (names.get(row.author_id) ?? "Teammate") : "System",
      body: row.body,
      createdAt: row.created_at,
    })),
    quotes,
  };
}

export type ClientInput = {
  orgId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  vip?: boolean;
  tags?: string[];
  notes?: string;
  accountId?: string | null;
};

export async function insertClient(input: ClientInput) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      org_id: input.orgId,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      company: input.company || null,
      vip: input.vip ?? false,
      tags: input.tags ?? [],
      notes: input.notes ?? "",
      account_id: input.accountId ?? null,
    })
    .select(CLIENT_SELECT)
    .single();
  if (error) throw error;
  return mapClient(data as unknown as ClientRow);
}

export async function updateClient(id: string, orgId: string, patch: Partial<ClientInput>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.email !== undefined ? { email: patch.email || null } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone || null } : {}),
      ...(patch.company !== undefined ? { company: patch.company || null } : {}),
      ...(patch.vip !== undefined ? { vip: patch.vip } : {}),
      ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      ...(patch.accountId !== undefined ? { account_id: patch.accountId } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("org_id", orgId)
    .eq("id", id);
  if (error) throw error;
}

export async function insertClientNote(
  orgId: string,
  clientId: string,
  authorId: string,
  body: string,
) {
  const supabase = createClient();
  const { error } = await supabase.from("client_notes").insert({
    org_id: orgId,
    client_id: clientId,
    author_id: authorId,
    body,
  });
  if (error) throw error;
}

export async function upsertAccount(orgId: string, account: { id?: string; name: string; notes: string; billingEmail?: string }) {
  const supabase = createClient();
  const payload = {
    org_id: orgId,
    name: account.name,
    notes: account.notes,
    billing_email: account.billingEmail || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = account.id
    ? await supabase.from("accounts").update(payload).eq("org_id", orgId).eq("id", account.id)
    : await supabase.from("accounts").insert(payload);
  if (error) throw error;
}
