import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
        <Mascot size={96} className="animate-bounce-soft" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-28">
      <div className="mx-auto max-w-md px-4">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
