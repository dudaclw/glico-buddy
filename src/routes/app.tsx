import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-farm pb-28 text-[#4a3828]">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-sky-pixels" />
      <Link
        to="/app/farm"
        className="fixed right-4 top-4 z-30 grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#8b613b] bg-[#F7D66B] text-[#5f3f23] shadow-cozy active:scale-95"
        aria-label="Abrir Fazenda da Saúde"
      >
        <Sprout className="h-6 w-6" strokeWidth={3} />
      </Link>
      <main className="relative mx-auto min-h-screen max-w-md px-4 pt-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
