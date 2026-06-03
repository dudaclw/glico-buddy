import { createFileRoute } from "@tanstack/react-router";
import { Activity, ArrowDown, ArrowUp, BarChart3, Hash, Layers3, TrendingUp } from "lucide-react";
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
import { useMeasurements } from "@/hooks/useMeasurements";
import { TARGET_MAX, TARGET_MIN } from "@/types/measurement";
import {
  getChartData,
  getMeasurementSummary,
  getPeriodGroups,
} from "@/utils/measurementCalculations";

export const Route = createFileRoute("/app/reports")({
  component: Reports,
});

function Reports() {
  const { measurements } = useMeasurements();
  const summary = getMeasurementSummary(measurements);
  const chartData = getChartData(measurements);
  const periodGroups = getPeriodGroups(measurements).filter((item) => item.count > 0);

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
          label="Média geral"
          value={summary.averageAll === null ? "--" : `${summary.averageAll}`}
          helper={summary.averageAll === null ? "sem registros" : "mg/dL"}
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Média do mês"
          value={summary.averageMonth === null ? "--" : `${summary.averageMonth}`}
          helper={summary.averageMonth === null ? "sem registros" : "mg/dL"}
        />
        <StatCard
          icon={<ArrowUp className="h-5 w-5" />}
          label="Maior"
          value={summary.highest ? `${summary.highest.glucoseValue}` : "--"}
          helper={summary.highest ? "mg/dL" : "sem registros"}
        />
        <StatCard
          icon={<ArrowDown className="h-5 w-5" />}
          label="Menor"
          value={summary.lowest ? `${summary.lowest.glucoseValue}` : "--"}
          helper={summary.lowest ? "mg/dL" : "sem registros"}
        />
      </div>

      <StatCard
        icon={<Hash className="h-5 w-5" />}
        label="Total de medições"
        value={`${summary.totalCount}`}
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
          {chartData.length === 0 ? (
            <div className="grid h-full place-items-center px-4 text-center">
              <div>
                <p className="text-base font-black text-[#4a3828]">
                  Os gráficos aparecerão após seus primeiros registros.
                </p>
                <p className="mt-1 text-sm font-bold text-[#8a6b45]">
                  Nenhuma medição registrada ainda.
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#ead7ad" strokeDasharray="4 4" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#7c6242", fontWeight: 800 }} />
                <YAxis
                  domain={[40, 230]}
                  tick={{ fontSize: 10, fill: "#7c6242", fontWeight: 800 }}
                />
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
          )}
        </div>
      </CozyCard>

      <CozyCard>
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F7D66B] text-[#7b5a35]">
            <Layers3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-black text-[#4a3828]">Por período</h2>
            <p className="text-xs font-bold text-[#8a6b45]">Agrupamento dos seus registros</p>
          </div>
        </div>
        {periodGroups.length === 0 ? (
          <p className="rounded-2xl bg-[#fffdf4] px-3 py-3 text-sm font-bold text-[#8a6b45]">
            Nenhuma medição registrada ainda.
          </p>
        ) : (
          <div className="grid gap-2">
            {periodGroups.map((item) => (
              <div
                key={item.period}
                className="flex items-center justify-between rounded-2xl bg-[#fffdf4] px-3 py-3 text-sm font-black text-[#6f5738]"
              >
                <span>{item.label}</span>
                <span>
                  {item.count} reg. {item.average ? `· média ${item.average}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </CozyCard>
    </div>
  );
}
