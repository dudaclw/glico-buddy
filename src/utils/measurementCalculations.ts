import type { Measurement } from "@/types/measurement";
import { periods } from "@/types/measurement";

export type MeasurementSummary = {
  averageAll: number | null;
  averageToday: number | null;
  averageMonth: number | null;
  latest: Measurement | null;
  highest: Measurement | null;
  lowest: Measurement | null;
  totalCount: number;
  todayCount: number;
  monthCount: number;
};

export function getTodayKey() {
  return formatDateKey(new Date());
}

export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function averageGlucose(list: Measurement[]) {
  if (list.length === 0) return null;
  return Math.round(list.reduce((total, item) => total + item.glucoseValue, 0) / list.length);
}

export function getMeasurementSummary(measurements: Measurement[]): MeasurementSummary {
  const today = getTodayKey();
  const month = getMonthKey();
  const todayMeasurements = measurements.filter((item) => item.date === today);
  const monthMeasurements = measurements.filter((item) => item.date.startsWith(month));

  return {
    averageAll: averageGlucose(measurements),
    averageToday: averageGlucose(todayMeasurements),
    averageMonth: averageGlucose(monthMeasurements),
    latest: measurements[0] ?? null,
    highest: measurements.reduce<Measurement | null>(
      (highest, item) => (!highest || item.glucoseValue > highest.glucoseValue ? item : highest),
      null,
    ),
    lowest: measurements.reduce<Measurement | null>(
      (lowest, item) => (!lowest || item.glucoseValue < lowest.glucoseValue ? item : lowest),
      null,
    ),
    totalCount: measurements.length,
    todayCount: todayMeasurements.length,
    monthCount: monthMeasurements.length,
  };
}

export function groupMeasurementsByDate(measurements: Measurement[]) {
  const map = new Map<string, Measurement[]>();
  measurements.forEach((item) => {
    map.set(item.date, [...(map.get(item.date) ?? []), item]);
  });
  return Array.from(map.entries());
}

export function getPeriodGroups(measurements: Measurement[]) {
  return periods.map((period) => {
    const list = measurements.filter((item) => item.period === period.id);
    return {
      period: period.id,
      label: period.label,
      count: list.length,
      average: averageGlucose(list),
    };
  });
}

export type ChartRangeOption = "7d" | "30d" | "90d" | "all";

export const CHART_RANGE_OPTIONS: Array<{ value: ChartRangeOption; label: string }> = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "all", label: "Tudo" },
];

// Above this many points a raw line gets too dense to read on a small screen,
// so the chart switches to one averaged point per day instead.
const CHART_AGGREGATION_THRESHOLD = 40;

export function filterMeasurementsByRange(measurements: Measurement[], range: ChartRangeOption) {
  if (range === "all") return measurements;

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffKey = formatDateKey(cutoff);

  return measurements.filter((item) => item.date >= cutoffKey);
}

function formatChartDay(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function getChartData(measurements: Measurement[]) {
  const chronological = measurements.slice().reverse();

  if (chronological.length <= CHART_AGGREGATION_THRESHOLD) {
    return {
      data: chronological.map((item) => ({
        day: formatChartDay(item.date),
        glicemia: item.glucoseValue,
      })),
      aggregated: false,
    };
  }

  const byDay = new Map<string, number[]>();
  chronological.forEach((item) => {
    byDay.set(item.date, [...(byDay.get(item.date) ?? []), item.glucoseValue]);
  });

  return {
    data: Array.from(byDay.entries()).map(([date, values]) => ({
      day: formatChartDay(date),
      glicemia: Math.round(values.reduce((total, value) => total + value, 0) / values.length),
    })),
    aggregated: true,
  };
}
