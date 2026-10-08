import { createClient } from "@/lib/supabase/client";
import type { ChatChannel, ChatMessage } from "@/data/chat";
import { fetchProfileNames } from "@/lib/db/org";

type ChannelRow = {
  id: string;
  kind: "channel" | "dm" | "trip";
  name: string | null;
  topic: string | null;
  trip_id: string | null;
};

type MessageRow = {
  id: number;
  channel_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
};

function mapChannel(row: ChannelRow): ChatChannel {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name ?? "channel",
    topic: row.topic ?? undefined,
    tripRef: row.trip_id ?? undefined,
  };
}

function mapMessage(row: MessageRow, names: Map<string, string>): ChatMessage {
  return {
    id: String(row.id),
    channelId: row.channel_id,
    author: names.get(row.author_id ?? "") ?? "Unknown",
    body: row.body,
    createdAt: row.created_at,
  };
}

const DEFAULT_CHANNELS = [
  { name: "dispatch", topic: "Live operations — active trips and handoffs" },
  { name: "ops", topic: "Fleet, schedules, and coverage" },
  { name: "general", topic: "Everything else" },
];

export async function ensureDefaultChannels(orgId: string, userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("channels")
    .insert(
      DEFAULT_CHANNELS.map((channel) => ({
        org_id: orgId,
        kind: "channel" as const,
        name: channel.name,
        topic: channel.topic,
        created_by: userId,
      })),
    )
    .select("id");
  for (const channel of data ?? []) {
    await supabase
      .from("channel_members")
      .upsert({ channel_id: channel.id, user_id: userId });
  }
}

export async function fetchChatData(userId: string, orgId: string) {
  const supabase = createClient();

  const [channelsResult, membershipsResult, { data: messages }, names] =
    await Promise.all([
      supabase
        .from("channels")
        .select("id, kind, name, topic, trip_id")
        .order("created_at", { ascending: true }),
      supabase
        .from("channel_members")
        .select("channel_id, last_read_at")
        .eq("user_id", userId),
      supabase
        .from("messages")
        .select("id, channel_id, author_id, body, created_at")
        .order("created_at", { ascending: true })
        .limit(500),
      fetchProfileNames(),
    ]);

  let channels = channelsResult.data;
  let memberships = membershipsResult.data;

  if ((channels ?? []).length === 0) {
    await ensureDefaultChannels(orgId, userId);
    const refetch = await supabase
      .from("channels")
      .select("id, kind, name, topic, trip_id")
      .order("created_at", { ascending: true });
    channels = refetch.data;
    const memberRefetch = await supabase
      .from("channel_members")
      .select("channel_id, last_read_at")
      .eq("user_id", userId);
    memberships = memberRefetch.data;
  }

  const lastRead: Record<string, string> = {};
  for (const membership of memberships ?? []) {
    lastRead[membership.channel_id] = membership.last_read_at;
  }

  return {
    channels: ((channels ?? []) as ChannelRow[]).map(mapChannel),
    lastRead,
    messages: ((messages ?? []) as MessageRow[]).map((row) =>
      mapMessage(row, names),
    ),
  };
}

export async function insertMessage(input: {
  orgId: string;
  channelId: string;
  userId: string;
  body: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      org_id: input.orgId,
      channel_id: input.channelId,
      author_id: input.userId,
      body: input.body,
    })
    .select("id, channel_id, author_id, body, created_at")
    .single();
  if (error) throw error;
  return data as MessageRow;
}

export async function markChannelRead(channelId: string, userId: string) {
  const supabase = createClient();
  await supabase.from("channel_members").upsert({
    channel_id: channelId,
    user_id: userId,
    last_read_at: new Date().toISOString(),
  });
}
