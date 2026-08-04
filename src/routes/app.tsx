import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    // ponytail: session check só roda no client (supabase usa localStorage) — SSR passa direto.
    // Se algum dia /app renderizar dados sensíveis no servidor, trocar por checagem via cookie/header.
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const location = useLocation();
  const showFarmButton = location.pathname !== "/app/farm";

  return (
    <div className="min-h-screen bg-farm pb-28 text-[#4a3828]">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-sky-pixels" />
      {showFarmButton && (
        <Link
          to="/app/farm"
          className="fixed right-4 top-4 z-30 grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#8b613b] bg-[#F7D66B] text-[#5f3f23] shadow-cozy active:scale-95"
          aria-label="Abrir Fazenda da Saúde"
        >
          <Sprout className="h-6 w-6" strokeWidth={3} />
        </Link>
      )}
      <main className="relative mx-auto min-h-screen max-w-md px-4 pt-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
