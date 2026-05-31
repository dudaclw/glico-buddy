import { createFileRoute } from "@tanstack/react-router";
import { Activity, ArrowDown, ArrowUp, BarChart3, Hash, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CozyCard, StatCard } from "@/components/cozy";
import { averageGlucose, measurements, TARGET_MAX, TARGET_MIN } from "@/lib/prototype-data";

export const Route = createFileRoute("/app/reports")({
  component: Reports,
});

function Reports() {
  const average7 = averageGlucose(measurements.slice(0, 7));
  const average30 = averageGlucose(measurements);
  const highest = Math.max(...measurements.map((item) => item.glucose));
  const lowest = Math.min(...measurements.map((item) => item.glucose));
  const chartData = measurements
    .slice()
    .reverse()
    .map((item) => ({
      day: new Date(item.measuredAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      glicemia: item.glucose,
    }));

  return (
    <div className="space-y-4 pt-2">
      <header>
        <p className="text-sm font-black uppercase tracking-wide text-[#5e8e57]">Celeiro</p>
        <h1 className="text-3xl font-black text-[#4a3828]">Relatórios</h1>
        <p className="mt-1 text-sm font-bold text-[#7c6242]">
          Números úteis com cara de mapa da fazenda.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Média 7 dias"
          value={`${average7}`}
          helper="mg/dL"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Média 30 dias"
          value={`${average30}`}
          helper="mg/dL"
        />
        <StatCard
          icon={<ArrowUp className="h-5 w-5" />}
          label="Maior"
          value={`${highest}`}
          helper="mg/dL"
        />
        <StatCard
          icon={<ArrowDown className="h-5 w-5" />}
          label="Menor"
          value={`${lowest}`}
          helper="mg/dL"
        />
      </div>

      <StatCard
        icon={<Hash className="h-5 w-5" />}
        label="Total de medições"
        value={`${measurements.length}`}
        helper="registros no diário"
      />

      <CozyCard variant="sky" className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F7D66B] text-[#7b5a35]">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-black text-[#4a3828]">Evolução glicêmica</h2>
            <p className="text-xs font-bold text-[#6a7f91]">Linha simples dos últimos registros</p>
          </div>
        </div>
        <div className="h-64 rounded-3xl border-2 border-[#9ccded] bg-[#fffdf4] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#ead7ad" strokeDasharray="4 4" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#7c6242", fontWeight: 800 }} />
              <YAxis domain={[40, 230]} tick={{ fontSize: 10, fill: "#7c6242", fontWeight: 800 }} />
              <ReferenceArea y1={TARGET_MIN} y2={TARGET_MAX} fill="#B8E986" fillOpacity={0.25} />
              <Tooltip
                contentStyle={{
                  background: "#FFF7E6",
                  border: "2px solid #A67C52",
                  borderRadius: 16,
                  color: "#4a3828",
                  fontWeight: 800,
                }}
              />
              <Line
                type="monotone"
                dataKey="glicemia"
                stroke="#7CC576"
                strokeWidth={4}
                dot={{ r: 5, fill: "#F7D66B", stroke: "#A67C52", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: "#FFC48C", stroke: "#A67C52", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CozyCard>
    </div>
  );
}
