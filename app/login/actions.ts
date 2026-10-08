"use server";

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import { redirect } from "next/navigation";

const DEV_PASSWORD = "12345678";

export async function signIn(formData: FormData) {
  if (!SUPABASE_CONFIGURED) {
    redirect("/login?error=Supabase%20is%20not%20configured%20yet");
  }

  const email = String(formData.get("email") ?? "").trim();
  let password = String(formData.get("password") ?? "");

  if (process.env.NODE_ENV !== "production" && password === DEV_PASSWORD) {
    try {
      password = readFileSync(
        join(homedir(), ".bng-desk-seed-password.txt"),
        "utf8",
      ).trim();
    } catch {}
  }

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
