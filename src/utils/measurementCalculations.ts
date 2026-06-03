import { TARGET_MAX, TARGET_MIN, type Measurement, periods } from "@/types/measurement";

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

export function getChartData(measurements: Measurement[]) {
  return measurements
    .slice()
    .reverse()
    .map((item) => ({
      day: new Date(`${item.date}T12:00:00`).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      glicemia: item.glucoseValue,
      targetMin: TARGET_MIN,
      targetMax: TARGET_MAX,
    }));
}
