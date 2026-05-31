import { Link, useLocation } from "@tanstack/react-router";
import { Home, History, BarChart3, User, Plus } from "lucide-react";

const items = [
  { to: "/app", icon: Home, label: "Início" },
  { to: "/app/history", icon: History, label: "Histórico" },
  { to: "/app/reports", icon: BarChart3, label: "Relatórios" },
  { to: "/app/profile", icon: User, label: "Perfil" },
] as const;

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pt-2">
        {items.slice(0, 2).map((it) => (
          <NavBtn key={it.to} {...it} active={loc.pathname === it.to} />
        ))}
        <Link
          to="/app/new"
          className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-cute transition-transform active:scale-95"
          aria-label="Nova medição"
        >
          <Plus className="h-7 w-7" strokeWidth={3} />
        </Link>
        {items.slice(2).map((it) => (
          <NavBtn key={it.to} {...it} active={loc.pathname === it.to} />
        ))}
      </div>
    </nav>
  );
}

function NavBtn({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: typeof Home;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex w-16 flex-col items-center gap-0.5 py-1 text-xs transition-colors ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-semibold">{label}</span>
    </Link>
  );
}
