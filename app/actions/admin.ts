"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";

export type InviteResult = { ok: true } | { ok: false; error: string };

export async function inviteMember(
  email: string,
  displayName: string,
  role: "admin" | "dispatcher",
): Promise<InviteResult> {
  if (!SUPABASE_CONFIGURED) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();
  if (membership?.role !== "admin") {
    return { ok: false, error: "Only admins can invite members" };
  }

  const admin = createAdminClient();
  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { display_name: displayName },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login`,
    });
  if (inviteError) return { ok: false, error: inviteError.message };

  const { error: memberError } = await supabase.from("org_members").insert({
    org_id: membership.org_id,
    user_id: invited.user.id,
    role,
  });
  if (memberError) {
    const duplicate = memberError.code === "23505";
    if (!duplicate) return { ok: false, error: memberError.message };
    const { error: updateError } = await supabase
      .from("org_members")
      .update({ role })
      .eq("org_id", membership.org_id)
      .eq("user_id", invited.user.id);
    if (updateError) return { ok: false, error: updateError.message };
  }

  await supabase.from("audit_events").insert({
    org_id: membership.org_id,
    actor_id: user.id,
    action: `invited ${email} as ${role}`,
    entity: "org_member",
    entity_id: invited.user.id,
  });

  return { ok: true };
}
