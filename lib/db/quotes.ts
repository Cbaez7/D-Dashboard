import { createClient } from "@/lib/supabase/client";
import type { QuoteInput, QuoteResult } from "@/lib/quote/engine";

export type QuoteStatus = "draft" | "sent" | "accepted" | "expired";

export type QuoteRoute = {
  pickup: string;
  stops: string[];
  dropoff: string;
  garageToPU: boolean;
  doToGarage: boolean;
};

export type QuotePayload = {
  input: QuoteInput;
  result: QuoteResult;
  route?: QuoteRoute;
};

export type SavedQuote = {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  tripType: string | null;
  vehicle: string | null;
  pickup: Record<string, unknown> | null;
  dropoff: Record<string, unknown> | null;
  breakdown: QuotePayload | null;
  totalCents: number | null;
  status: QuoteStatus;
  emailedAt: string | null;
  createdAt: string;
};

type QuoteRow = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  trip_type: string | null;
  vehicle: string | null;
  pickup: Record<string, unknown> | null;
  dropoff: Record<string, unknown> | null;
  breakdown: QuotePayload | null;
  total_cents: number | null;
  status: QuoteStatus;
  emailed_at: string | null;
  created_at: string;
};

function mapQuote(row: QuoteRow): SavedQuote {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    tripType: row.trip_type,
    vehicle: row.vehicle,
    pickup: row.pickup,
    dropoff: row.dropoff,
    breakdown: row.breakdown,
    totalCents: row.total_cents,
    status: row.status,
    emailedAt: row.emailed_at,
    createdAt: row.created_at,
  };
}

export async function fetchQuotes(orgId: string): Promise<SavedQuote[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, customer_name, customer_email, customer_phone, trip_type, vehicle, pickup, dropoff, breakdown, total_cents, status, emailed_at, created_at",
    )
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return ((data ?? []) as QuoteRow[]).map(mapQuote);
}

export type SaveQuoteInput = {
  orgId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  input: QuoteInput;
  result: QuoteResult;
  route: QuoteRoute;
};

function locationFor(input: QuoteInput) {
  if (input.serviceType === "Airport") {
    return {
      pickup: input.airportService.includes("Drop-off")
        ? null
        : { airport: input.airportService, city: input.city },
      dropoff: input.airportService.includes("Drop-off")
        ? { airport: input.airportService, city: input.city }
        : { city: input.city },
    };
  }
  if (input.serviceType === "P2P") {
    return {
      pickup: input.pickupCity ? { city: input.pickupCity } : null,
      dropoff: input.dropoffCity ? { city: input.dropoffCity } : null,
    };
  }
  return {
    pickup: input.city ? { city: input.city } : null,
    dropoff: null,
  };
}

export async function insertQuote(entry: SaveQuoteInput) {
  const supabase = createClient();
  const { pickup, dropoff } = locationFor(entry.input);
  const { error } = await supabase.from("quotes").insert({
    org_id: entry.orgId,
    created_by: entry.userId,
    customer_name: entry.customerName || null,
    customer_email: entry.customerEmail || null,
    customer_phone: entry.customerPhone || null,
    trip_type:
      entry.input.clientType === "Corporate"
        ? `Corporate — ${entry.input.corporate.account}`
        : entry.input.serviceType || null,
    vehicle: entry.input.vehicle || null,
    pickup,
    dropoff,
    breakdown: {
      input: entry.input,
      result: entry.result,
      route: entry.route,
    },
    total_cents: Math.round(entry.result.total * 100),
    status: "draft",
  });
  if (error) throw error;
}

export async function updateQuoteStatus(
  orgId: string,
  id: string,
  status: QuoteStatus,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("quotes")
    .update({
      status,
      ...(status === "sent" ? { emailed_at: new Date().toISOString() } : {}),
    })
    .eq("org_id", orgId)
    .eq("id", id);
  if (error) throw error;
}
