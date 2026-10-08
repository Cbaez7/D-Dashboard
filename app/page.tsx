import Sidebar from "@/components/_common/sidebar/sidebar";
import AppShell from "@/components/_common/app-shell";

export default function Home() {
  return (
    <main className="flex h-dvh max-w-full overflow-hidden">
      <Sidebar />
      <AppShell />
    </main>
  );
}
