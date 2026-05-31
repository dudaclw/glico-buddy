import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, ClipboardList, Home, Sprout, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app", icon: Home, label: "Início" },
  { to: "/app/new", icon: Sprout, label: "Registrar" },
  { to: "/app/history", icon: ClipboardList, label: "Histórico" },
  { to: "/app/reports", icon: BarChart3, label: "Relatórios" },
  { to: "/app/profile", icon: UserRound, label: "Perfil" },
] as const;

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[#8b613b] bg-[#FFF7E6]/95 shadow-[0_-10px_30px_rgba(95,63,35,0.16)] backdrop-blur safe-bottom">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 pt-2">
        {items.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-black transition active:scale-95",
                active
                  ? "bg-[#F7D66B] text-[#5f3f23] shadow-tile"
                  : "text-[#7c6242] hover:bg-[#fff0c8]",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2.6} />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
