import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-farm pb-28 text-[#4a3828]">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-sky-pixels" />
      <main className="relative mx-auto min-h-screen max-w-md px-4 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
