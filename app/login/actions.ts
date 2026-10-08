"use server";

import { createClient } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  if (!SUPABASE_CONFIGURED) {
    redirect("/login?error=Supabase%20is%20not%20configured%20yet");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}

export async function signOut() {
  if (SUPABASE_CONFIGURED) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
