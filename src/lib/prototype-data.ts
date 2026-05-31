export type GlucoseStatus = "low" | "ideal" | "high";

export type PeriodId =
  | "jejum"
  | "cafe"
  | "antes_almoco"
  | "apos_almoco"
  | "cafe_tarde"
  | "antes_jantar"
  | "apos_jantar"
  | "dormir"
  | "madrugada";

export type Measurement = {
  id: string;
  measuredAt: string;
  period: PeriodId;
  glucose: number;
  insulinUnits?: number;
  insulinType?: string;
  notes?: string;
};

export const TARGET_MIN = 70;
export const TARGET_MAX = 180;

export const periods: Array<{
  id: PeriodId;
  label: string;
  shortLabel: string;
  timeHint: string;
}> = [
  { id: "jejum", label: "Jejum", shortLabel: "Jejum", timeHint: "manhã" },
  { id: "cafe", label: "Café da manhã", shortLabel: "Café", timeHint: "após acordar" },
  { id: "antes_almoco", label: "Antes do almoço", shortLabel: "Pré almoço", timeHint: "meio-dia" },
  { id: "apos_almoco", label: "Após almoço", shortLabel: "Pós almoço", timeHint: "tarde" },
  { id: "cafe_tarde", label: "Café da tarde", shortLabel: "Lanche", timeHint: "tarde" },
  { id: "antes_jantar", label: "Antes do jantar", shortLabel: "Pré jantar", timeHint: "noite" },
  { id: "apos_jantar", label: "Após jantar", shortLabel: "Pós jantar", timeHint: "noite" },
  { id: "dormir", label: "Antes de dormir", shortLabel: "Dormir", timeHint: "fim do dia" },
  { id: "madrugada", label: "Madrugada", shortLabel: "Madrugada", timeHint: "sono" },
];

export const insulinTypes = ["Rápida", "Ultrarrápida", "NPH", "Basal", "Pré-misturada", "Outra"];

export const measurements: Measurement[] = [
  {
    id: "m1",
    measuredAt: "2026-05-31T07:20:00",
    period: "jejum",
    glucose: 96,
    insulinUnits: 0,
    notes: "Acordei bem",
  },
  {
    id: "m2",
    measuredAt: "2026-05-31T12:08:00",
    period: "antes_almoco",
    glucose: 118,
    insulinUnits: 2,
    insulinType: "Rápida",
  },
  {
    id: "m3",
    measuredAt: "2026-05-31T15:42:00",
    period: "cafe_tarde",
    glucose: 164,
    notes: "Lanche com fruta",
  },
  {
    id: "m4",
    measuredAt: "2026-05-30T08:10:00",
    period: "cafe",
    glucose: 104,
  },
  {
    id: "m5",
    measuredAt: "2026-05-30T13:35:00",
    period: "apos_almoco",
    glucose: 188,
    insulinUnits: 3,
    insulinType: "Ultrarrápida",
  },
  {
    id: "m6",
    measuredAt: "2026-05-29T22:18:00",
    period: "dormir",
    glucose: 82,
  },
  {
    id: "m7",
    measuredAt: "2026-05-29T03:16:00",
    period: "madrugada",
    glucose: 64,
    notes: "Acordei tremendo",
  },
  {
    id: "m8",
    measuredAt: "2026-05-28T19:02:00",
    period: "antes_jantar",
    glucose: 137,
    insulinUnits: 1,
    insulinType: "Rápida",
  },
  {
    id: "m9",
    measuredAt: "2026-05-27T20:48:00",
    period: "apos_jantar",
    glucose: 173,
  },
  {
    id: "m10",
    measuredAt: "2026-05-26T07:32:00",
    period: "jejum",
    glucose: 91,
  },
];

export function getGlucoseStatus(value: number): GlucoseStatus {
  if (value < TARGET_MIN) return "low";
  if (value > TARGET_MAX) return "high";
  return "ideal";
}

export function getStatusLabel(status: GlucoseStatus) {
  if (status === "low") return "Hipo";
  if (status === "high") return "Alta";
  return "Ideal";
}

export function getPeriodLabel(period: PeriodId) {
  return periods.find((item) => item.id === period)?.label ?? period;
}

export function averageGlucose(list: Measurement[]) {
  if (list.length === 0) return 0;
  return Math.round(list.reduce((total, item) => total + item.glucose, 0) / list.length);
}

export function todaysMeasurements() {
  return measurements.filter((item) => item.measuredAt.startsWith("2026-05-31"));
}
