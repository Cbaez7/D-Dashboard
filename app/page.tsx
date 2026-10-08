import Sidebar from "@/components/_common/sidebar/sidebar";
import AppShell from "@/components/_common/app-shell";
import SessionSync from "@/components/_common/session-sync";
import { getSessionContext } from "@/lib/session";

export default async function Home() {
  const session = await getSessionContext();
  return (
    <main className="flex h-dvh max-w-full overflow-hidden">
      <SessionSync session={session} />
      <Sidebar />
      <AppShell />
    </main>
  );
}
