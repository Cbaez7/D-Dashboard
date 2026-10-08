import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/stores/app-store";
import type { SessionData } from "@/stores/session-store";

function initialsOf(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || (email[0] ?? "?").toUpperCase();
}

export async function getSessionContext(): Promise<SessionData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: member }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, first_name, last_name, timezone, leave_allowance_days")
      .eq("id", user.id)
      .single(),
    supabase
      .from("org_members")
      .select("org_id, role, orgs(name, ops_timezone)")
      .eq("user_id", user.id)
      .limit(1)
      .single(),
  ]);

  const email = user.email ?? "";
  const joined = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");
  const displayName =
    joined || profile?.display_name || email.split("@")[0] || "Dispatcher";
  const org = Array.isArray(member?.orgs) ? member?.orgs[0] : member?.orgs;

  return {
    userId: user.id,
    email,
    displayName,
    initials: initialsOf(displayName, email),
    orgId: member?.org_id ?? "",
    orgName: org?.name ?? "",
    opsTz: org?.ops_timezone ?? "America/Los_Angeles",
    myTz: profile?.timezone ?? "America/New_York",
    leaveAllowanceDays: profile?.leave_allowance_days ?? 20,
    role: (member?.role as Role) ?? "dispatcher",
  };
}
