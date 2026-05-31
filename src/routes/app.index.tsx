import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Mascot } from "@/components/Mascot";
import { classify, periodEmoji, periodLabel, statusBg, statusLabel, PERIODS } from "@/lib/glucose";
import { Plus, TrendingUp, Activity, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ["measurements-recent", user?.id],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      const { data, error } = await supabase
        .from("measurements")
        .select("*")
        .gte("measured_at", since.toISOString())
        .order("measured_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const min = profile?.target_min ?? 70;
  const max = profile?.target_max ?? 180;

  const last = measurements[0];
  const today = new Date().toDateString();
  const todayMeasurements = measurements.filter(
    (m) => new Date(m.measured_at).toDateString() === today
  );
  const avg7 =
    measurements.length > 0
      ? Math.round(measurements.reduce((s, m) => s + m.glucose_value, 0) / measurements.length)
      : null;

  const periodCounts = PERIODS.map((p) => ({
    ...p,
    count: todayMeasurements.filter((m) => m.period === p.value).length,
  }));

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-2xl">{profile?.name ?? "amigo(a)"} 👋</h1>
        </div>
        <Mascot size={64} className="animate-wiggle" />
      </div>

      {/* Last reading hero */}
      <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-cute">
        <p className="text-xs font-bold uppercase tracking-wider opacity-80">Última glicemia</p>
        {last ? (
          <>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-5xl font-black leading-none">{last.glucose_value}</span>
              <span className="mb-1 text-sm opacity-90">mg/dL</span>
            </div>
            <p className="mt-2 text-sm opacity-90">
              {periodEmoji(last.period)} {periodLabel(last.period)} •{" "}
              {format(new Date(last.measured_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
            </p>
            <span
              className={`mt-3 inline-block rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur`}
            >
              {statusLabel(classify(last.glucose_value, min, max))}
            </span>
          </>
        ) : (
          <p className="mt-2 text-sm opacity-95">Nenhuma medição ainda. Vamos começar? 💪</p>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Média 7 dias"
          value={avg7 !== null ? `${avg7}` : "—"}
          suffix="mg/dL"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Medições hoje"
          value={`${todayMeasurements.length}`}
          suffix={todayMeasurements.length === 1 ? "registro" : "registros"}
        />
      </div>

      {/* CTA */}
      <Link
        to="/app/new"
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-card py-4 text-base font-extrabold text-primary shadow-soft transition active:scale-[0.98]"
      >
        <Plus className="h-5 w-5" strokeWidth={3} />
        Nova medição
      </Link>

      {/* Periods today */}
      <div className="mt-7 mb-2 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          Períodos de hoje
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {periodCounts.map((p) => (
          <div
            key={p.value}
            className={`rounded-2xl border p-3 ${
              p.count > 0 ? "bg-card border-border shadow-soft" : "bg-card/50 border-dashed border-border"
            }`}
          >
            <div className="text-2xl">{p.emoji}</div>
            <div className="mt-1 text-sm font-bold">{p.label}</div>
            <div className="text-xs text-muted-foreground">
              {p.count === 0 ? "Sem registro" : `${p.count} medição${p.count > 1 ? "ões" : ""}`}
            </div>
          </div>
        ))}
      </div>

      {/* Recent list */}
      {measurements.length > 0 && (
        <>
          <h2 className="mt-7 mb-2 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            Recentes
          </h2>
          <div className="space-y-2">
            {measurements.slice(0, 5).map((m) => {
              const s = classify(m.glucose_value, min, max);
              return (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
                  <div className="text-2xl">{periodEmoji(m.period)}</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{periodLabel(m.period)}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(m.measured_at), "dd/MM HH:mm")}
                    </div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-sm font-extrabold ${statusBg(s)}`}>
                    {m.glucose_value}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-soft">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-3xl font-black text-foreground">{value}</span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}
