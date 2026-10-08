import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("not found", { status: 404 });
  }

  let password: string;
  try {
    password = readFileSync(
      join(homedir(), ".bng-desk-seed-password.txt"),
      "utf8",
    ).trim();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: "cbaez@bnglimo.com",
    password,
  });

  const dest = error
    ? `/login?error=${encodeURIComponent(error.message)}`
    : "/";
  return new NextResponse(null, {
    status: 307,
    headers: { Location: dest },
  });
}
