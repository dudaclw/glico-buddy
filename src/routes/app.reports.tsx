import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarDays,
  Download,
  FileJson,
  Hash,
  Layers3,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { TARGET_MAX, TARGET_MIN, type Measurement } from "@/types/measurement";
import {
  CHART_RANGE_OPTIONS,
  type ChartRangeOption,
  filterMeasurementsByRange,
  getChartData,
  getMonthKey,
  getMeasurementSummary,
  getPeriodGroups,
} from "@/utils/measurementCalculations";

export const Route = createFileRoute("/app/reports")({
  component: Reports,
});

function Reports() {
  const { measurements } = useMeasurements();
  const summary = getMeasurementSummary(measurements);
  const [chartRange, setChartRange] = useState<ChartRangeOption>("7d");
  const chartMeasurements = useMemo(
    () => filterMeasurementsByRange(measurements, chartRange),
    [measurements, chartRange],
  );
  const chart = useMemo(() => getChartData(chartMeasurements), [chartMeasurements]);
  const chartTickInterval = Math.max(0, Math.ceil(chart.data.length / 6) - 1);
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

      <ExportDataCard measurements={measurements} />

      <CozyCard variant="sky" className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F7D66B] text-[#7b5a35]">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-black text-[#4a3828]">Evolução glicêmica</h2>
            <p className="text-xs font-bold text-[#6a7f91]">
              {chart.aggregated ? "Média diária do período" : "Registros do período"}
            </p>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {CHART_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setChartRange(option.value)}
              className={`rounded-2xl border-2 px-3 py-1.5 text-xs font-black transition ${
                chartRange === option.value
                  ? "border-[#8b613b] bg-[#F7D66B] text-[#5f3f23] shadow-tile"
                  : "border-[#9ccded] bg-[#fffdf4] text-[#6a7f91]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="h-64 rounded-3xl border-2 border-[#9ccded] bg-[#fffdf4] p-2">
          {chart.data.length === 0 ? (
            <div className="grid h-full place-items-center px-4 text-center">
              <div>
                <p className="text-base font-black text-[#4a3828]">
                  Os gráficos aparecerão após seus primeiros registros.
                </p>
                <p className="mt-1 text-sm font-bold text-[#8a6b45]">
                  Nenhuma medição {chartRange === "all" ? "registrada" : "neste período"} ainda.
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart.data} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#ead7ad" strokeDasharray="4 4" />
                <XAxis
                  dataKey="day"
                  interval={chartTickInterval}
                  tick={{ fontSize: 10, fill: "#7c6242", fontWeight: 800 }}
                />
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
                  dot={
                    chart.data.length > 20
                      ? false
                      : { r: 5, fill: "#F7D66B", stroke: "#A67C52", strokeWidth: 2 }
                  }
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

function ExportDataCard({ measurements }: { measurements: Measurement[] }) {
  const today = useMemo(() => new Date(), []);
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(getMonthKey(today) + "-01");
  const [endDate, setEndDate] = useState(formatDateKey(today));
  const [message, setMessage] = useState("");

  const validationError = getExportValidationError(startDate, endDate);

  function generateReport() {
    const error = getExportValidationError(startDate, endDate);
    if (error) {
      setMessage(error);
      return;
    }

    const selectedMeasurements = getMeasurementsInCreatedAtPeriod(measurements, startDate, endDate);

    if (selectedMeasurements.length === 0) {
      setMessage("Nenhuma medição encontrada nesse período.");
      return;
    }

    downloadJsonReport(
      buildExportReport(selectedMeasurements, startDate, endDate),
      startDate,
      endDate,
    );
    setMessage(`${selectedMeasurements.length} medições exportadas em JSON.`);
  }

  return (
    <CozyCard variant="grass" className="p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F7D66B] text-[#765739]">
          <FileJson className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-[#375629]">Relatório JSON</h2>
          <p className="text-xs font-bold text-[#547d37]">
            Gere um relatório local em formato JSON.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((value) => !value);
            setMessage("");
          }}
          aria-label={open ? "Fechar exportação" : "Abrir exportação de dados"}
          className="flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-[#8b613b] bg-[#fffdf4] px-3 text-sm font-black text-[#765739] active:scale-95"
        >
          {open ? <X className="h-5 w-5" /> : <Download className="h-5 w-5" />}
          <span>{open ? "Fechar" : "Exportar dados"}</span>
        </button>
      </div>

      {open && (
        <div className="mt-4 grid gap-3 rounded-2xl border-2 border-[#b6d795] bg-[#fffdf4] p-3 shadow-tile">
          <div className="grid grid-cols-2 gap-3">
            <DateField label="Data inicial" value={startDate} onChange={setStartDate} />
            <DateField label="Data final" value={endDate} onChange={setEndDate} />
          </div>

          {message && (
            <p className="rounded-2xl bg-[#FFF7E6] px-3 py-2 text-sm font-black text-[#765739]">
              {message}
            </p>
          )}

          {!message && validationError && (
            <p className="rounded-2xl bg-[#ffe4d2] px-3 py-2 text-sm font-black text-[#8f3f28]">
              {validationError}
            </p>
          )}

          <button
            type="button"
            onClick={generateReport}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[1.2rem] border-2 border-[#8b613b] bg-[#7CC576] px-5 text-base font-black text-white shadow-cozy transition active:scale-[0.98]"
          >
            <Download className="h-5 w-5" />
            Gerar relatório
          </button>
        </div>
      )}
    </CozyCard>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-xs font-black uppercase tracking-wide text-[#7c6242]">
        <CalendarDays className="h-4 w-4" />
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="cozy-input"
      />
    </label>
  );
}

function getExportValidationError(startDate: string, endDate: string) {
  if (!startDate) return "Informe a data inicial.";
  if (!endDate) return "Informe a data final.";
  if (startDate > endDate) return "A data inicial não pode ser maior que a data final.";
  return "";
}

function getMeasurementsInCreatedAtPeriod(
  measurements: Measurement[],
  startDate: string,
  endDate: string,
) {
  const startTime = new Date(`${startDate}T00:00:00`).getTime();
  const endTime = new Date(`${endDate}T23:59:59.999`).getTime();

  return measurements
    .filter((measurement) => {
      const createdAtTime = new Date(measurement.createdAt).getTime();
      return (
        Number.isFinite(createdAtTime) && createdAtTime >= startTime && createdAtTime <= endTime
      );
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function buildExportReport(measurements: Measurement[], startDate: string, endDate: string) {
  const glucoseValues = measurements.map((measurement) => measurement.glucose);
  const totalGlucose = glucoseValues.reduce((total, value) => total + value, 0);

  return {
    exportedAt: new Date().toISOString(),
    period: {
      startDate,
      endDate,
    },
    summary: {
      totalMeasurements: measurements.length,
      averageGlucose: Math.round(totalGlucose / measurements.length),
      minGlucose: Math.min(...glucoseValues),
      maxGlucose: Math.max(...glucoseValues),
    },
    measurements: measurements.map((measurement) => ({
      id: measurement.id,
      date: measurement.date,
      time: measurement.time ?? null,
      period: measurement.period,
      glucose: measurement.glucose,
      insulinUnits: measurement.insulinUnits ?? null,
      notes: measurement.notes ?? null,
    })),
  };
}

function downloadJsonReport(report: unknown, startDate: string, endDate: string) {
  const json = JSON.stringify(report, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `glicotrack-${startDate}-a-${endDate}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
