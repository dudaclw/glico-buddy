import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, CalendarCheck2, ChevronRight, Clock3, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CozyCard,
  GlucoseStatusBadge,
  PixelMascot,
  ProgressQuestBar,
  StatCard,
} from "@/components/cozy";
import { FarmDashboardCard } from "@/components/farm";
import { useFarm } from "@/hooks/useFarm";
import { useMeasurements } from "@/hooks/useMeasurements";
import { periods } from "@/types/measurement";
import { getMeasurementSummary, getTodayKey } from "@/utils/measurementCalculations";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function Dashboard() {
  const { measurements } = useMeasurements();
  const { farm } = useFarm();
  const [greeting, setGreeting] = useState("Olá");
  const summary = getMeasurementSummary(measurements);
  const questGoal = 4;
  const remainingToday = Math.max(0, questGoal - summary.todayCount);
  const completedPeriods = new Set(
    measurements.filter((item) => item.date === getTodayKey()).map((item) => item.period),
  );
  const nextMissions = periods.filter((period) => !completedPeriods.has(period.id)).slice(0, 3);

  useEffect(() => {
    const updateGreeting = () => setGreeting(getGreeting());

    updateGreeting();
    const intervalId = window.setInterval(updateGreeting, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[#5e8e57]">{greeting}</p>
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
        {summary.latest ? (
          <>
            <div className="relative mt-2 flex items-end gap-2">
              <span className="text-6xl font-black leading-none">
                {summary.latest.glucoseValue}
              </span>
              <span className="mb-2 text-sm font-black opacity-90">mg/dL</span>
            </div>
            <div className="relative mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Clock3 className="h-4 w-4" />
                {new Date(`${summary.latest.date}T12:00:00`).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
                {summary.latest.time ? `, ${summary.latest.time}` : ""}
              </div>
              <GlucoseStatusBadge value={summary.latest.glucoseValue} />
            </div>
          </>
        ) : (
          <div className="relative mt-4 rounded-2xl border-2 border-white/25 bg-white/10 p-4">
            <p className="text-sm font-black">Nenhuma medição registrada ainda.</p>
            <p className="mt-1 text-xs font-bold opacity-90">
              Cadastre sua primeira glicemia para visualizar o histórico.
            </p>
          </div>
        )}
      </CozyCard>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Média geral"
          value={summary.averageAll === null ? "--" : `${summary.averageAll}`}
          helper={summary.averageAll === null ? "sem registros" : "mg/dL"}
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Medições hoje"
          value={`${summary.todayCount}`}
          helper={remainingToday ? `${remainingToday} para completar` : "missão completa"}
        />
      </div>

      <ProgressQuestBar current={summary.todayCount} total={questGoal} />

      <FarmDashboardCard farm={farm} />

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
          {nextMissions.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl bg-[#fffdf4] px-3 py-3 text-sm font-black text-[#6f5738]"
            >
              <span>{item.label}</span>
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
