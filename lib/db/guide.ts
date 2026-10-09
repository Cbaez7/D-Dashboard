import { createClient } from "@/lib/supabase/client";
import type { SopPage } from "@/data/guide";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  body: string;
  version: number;
  requires_ack: boolean;
  updated_at: string;
};

function mapPage(row: PageRow): SopPage {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category ?? "General",
    body: row.body,
    version: row.version,
    requiresAck: row.requires_ack,
    updatedAt: row.updated_at,
  };
}

export async function fetchGuideData(userId: string) {
  const supabase = createClient();
  const [pagesResult, acksResult] = await Promise.all([
    supabase
      .from("sop_pages")
      .select("id, title, slug, category, body, version, requires_ack, updated_at")
      .eq("published", true)
      .order("position", { ascending: true })
      .order("title", { ascending: true }),
    supabase
      .from("sop_acknowledgments")
      .select("page_id, version")
      .eq("user_id", userId),
  ]);

  if (pagesResult.error) throw pagesResult.error;
  if (acksResult.error) throw acksResult.error;
  const pages = pagesResult.data;
  const acks = acksResult.data;

  const acknowledgments: Record<string, number> = {};
  for (const ack of acks ?? []) {
    if ((acknowledgments[ack.page_id] ?? 0) < ack.version) {
      acknowledgments[ack.page_id] = ack.version;
    }
  }

  return {
    pages: ((pages ?? []) as PageRow[]).map(mapPage),
    acknowledgments,
  };
}

export async function acknowledgePage(
  pageId: string,
  userId: string,
  version: number,
) {
  const supabase = createClient();
  const { error } = await supabase.from("sop_acknowledgments").upsert({
    page_id: pageId,
    user_id: userId,
    version,
  });
  if (error) throw error;
}

export async function saveSopPage(input: {
  page: SopPage;
  userId: string;
}) {
  const supabase = createClient();
  const nextVersion = input.page.version + 1;
  const { error } = await supabase
    .from("sop_pages")
    .update({
      title: input.page.title,
      category: input.page.category,
      body: input.page.body,
      requires_ack: input.page.requiresAck,
      version: nextVersion,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.page.id);
  if (error) throw error;
  await supabase.from("sop_revisions").insert({
    page_id: input.page.id,
    version: nextVersion,
    body: input.page.body,
    edited_by: input.userId,
  });
  return nextVersion;
}
