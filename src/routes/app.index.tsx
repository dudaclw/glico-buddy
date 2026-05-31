import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, CalendarCheck2, ChevronRight, Clock3, TrendingUp } from "lucide-react";
import {
  CozyCard,
  GlucoseStatusBadge,
  PixelMascot,
  ProgressQuestBar,
  StatCard,
} from "@/components/cozy";
import { averageGlucose, measurements, todaysMeasurements } from "@/lib/prototype-data";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const today = todaysMeasurements();
  const last = measurements[0];
  const average7 = averageGlucose(measurements.slice(0, 7));
  const questGoal = 4;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[#5e8e57]">Bom dia, Ana</p>
          <h1 className="mt-1 text-3xl font-black leading-tight text-[#4a3828]">
            Fazenda glicêmica
          </h1>
          <p className="mt-1 text-sm font-bold text-[#7c6242]">Sua rotina em clima de jogo cozy.</p>
        </div>
        <PixelMascot className="shrink-0 animate-bounce-soft" />
      </header>

      <CozyCard variant="wood" className="relative overflow-hidden p-5">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#F7D66B]/80" />
        <p className="relative text-xs font-black uppercase tracking-wide text-[#ffefc3]">
          Última glicemia
        </p>
        <div className="relative mt-2 flex items-end gap-2">
          <span className="text-6xl font-black leading-none">{last.glucose}</span>
          <span className="mb-2 text-sm font-black opacity-90">mg/dL</span>
        </div>
        <div className="relative mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Clock3 className="h-4 w-4" />
            Hoje, 07:20
          </div>
          <GlucoseStatusBadge value={last.glucose} />
        </div>
      </CozyCard>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Média 7 dias"
          value={`${average7}`}
          helper="mg/dL"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Medições hoje"
          value={`${today.length}`}
          helper={`${questGoal - today.length} para completar`}
        />
      </div>

      <ProgressQuestBar current={today.length} total={questGoal} />

      <Link
        to="/app/new"
        className="flex min-h-16 items-center justify-between rounded-[1.35rem] border-2 border-[#8b613b] bg-[#F7D66B] px-5 text-[#4a3828] shadow-cozy transition active:scale-[0.98]"
      >
        <span>
          <span className="block text-xs font-black uppercase tracking-wide text-[#765739]">
            Ação rápida
          </span>
          <span className="text-lg font-black">Registrar agora</span>
        </span>
        <ChevronRight className="h-7 w-7" strokeWidth={3} />
      </Link>

      <CozyCard className="mb-2">
        <div className="flex items-center gap-2">
          <CalendarCheck2 className="h-5 w-5 text-[#5e8e57]" />
          <h2 className="text-base font-black">Próximas missões</h2>
        </div>
        <div className="mt-3 grid gap-2">
          {["Antes do jantar", "Após jantar", "Antes de dormir"].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-2xl bg-[#fffdf4] px-3 py-3 text-sm font-black text-[#6f5738]"
            >
              <span>{item}</span>
              <span className="rounded-full bg-[#dff3c8] px-3 py-1 text-xs text-[#4d7d38]">
                pendente
              </span>
            </div>
          ))}
        </div>
      </CozyCard>
    </div>
  );
}
