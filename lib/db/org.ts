import { createClient } from "@/lib/supabase/client";

export type OrgMember = { id: string; name: string; role: string };

export async function fetchProfileNames(): Promise<Map<string, string>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, first_name, last_name");
  if (error) throw error;

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    const joined = [row.first_name, row.last_name].filter(Boolean).join(" ");
    map.set(row.id, joined || row.display_name || "Teammate");
  }
  return map;
}
