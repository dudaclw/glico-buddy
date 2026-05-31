import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { CozyCard, MeasurementCard } from "@/components/cozy";
import { measurements } from "@/lib/prototype-data";

export const Route = createFileRoute("/app/history")({
  component: History,
});

function History() {
  const [month, setMonth] = useState("2026-05");

  const filtered = useMemo(
    () => measurements.filter((item) => item.measuredAt.startsWith(month)),
    [month],
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((item) => {
      const key = item.measuredAt.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), item]);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-4 pt-2">
      <header>
        <p className="text-sm font-black uppercase tracking-wide text-[#5e8e57]">Diário</p>
        <h1 className="text-3xl font-black text-[#4a3828]">Histórico</h1>
        <p className="mt-1 text-sm font-bold text-[#7c6242]">
          Seus registros organizados como páginas de um caderno.
        </p>
      </header>

      <CozyCard className="p-3">
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#7c6242]">
          <Filter className="h-4 w-4" />
          Filtrar por mês
        </label>
        <input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="mt-2 h-14 w-full rounded-2xl border-2 border-[#dcbf8b] bg-[#fffdf4] px-4 text-base font-black text-[#4a3828] outline-none focus:border-[#A67C52]"
        />
      </CozyCard>

      <CozyCard variant="sky" className="p-3">
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black">
          <span className="rounded-2xl border-2 border-[#72b9ee] bg-[#A7D8FF] px-2 py-2 text-[#255a7c]">
            Hipo &lt; 70
          </span>
          <span className="rounded-2xl border-2 border-[#82cf67] bg-[#B8E986] px-2 py-2 text-[#315b25]">
            Ideal 70-180
          </span>
          <span className="rounded-2xl border-2 border-[#f1a85f] bg-[#FFC48C] px-2 py-2 text-[#75451b]">
            Alta &gt; 180
          </span>
        </div>
      </CozyCard>

      {groups.map(([date, list]) => (
        <section key={date} className="space-y-2">
          <div className="flex items-center gap-2 px-1 text-[#5e8e57]">
            <CalendarDays className="h-5 w-5" />
            <h2 className="text-sm font-black uppercase tracking-wide">
              {new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </h2>
          </div>
          {list.map((measurement) => (
            <MeasurementCard key={measurement.id} measurement={measurement} />
          ))}
        </section>
      ))}
    </div>
  );
}
