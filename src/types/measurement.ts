export type PeriodId =
  | "jejum"
  | "antes_cafe"
  | "depois_cafe"
  | "antes_almoco"
  | "depois_almoco"
  | "antes_jantar"
  | "depois_jantar"
  | "antes_dormir"
  | "madrugada"
  | "outro";

export type Measurement = {
  id: string;
  date: string;
  time?: string;
  period: PeriodId;
  glucoseValue: number;
  insulinUnits?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type MeasurementInput = Omit<Measurement, "id" | "createdAt" | "updatedAt">;

export const TARGET_MIN = 70;
export const TARGET_MAX = 180;

export const periods: Array<{
  id: PeriodId;
  label: string;
  shortLabel: string;
  timeHint: string;
}> = [
  { id: "jejum", label: "Jejum", shortLabel: "Jejum", timeHint: "ao acordar" },
  { id: "antes_cafe", label: "Antes do café", shortLabel: "Pré café", timeHint: "manhã" },
  { id: "depois_cafe", label: "Depois do café", shortLabel: "Pós café", timeHint: "manhã" },
  { id: "antes_almoco", label: "Antes do almoço", shortLabel: "Pré almoço", timeHint: "meio-dia" },
  { id: "depois_almoco", label: "Depois do almoço", shortLabel: "Pós almoço", timeHint: "tarde" },
  { id: "antes_jantar", label: "Antes do jantar", shortLabel: "Pré jantar", timeHint: "noite" },
  { id: "depois_jantar", label: "Depois do jantar", shortLabel: "Pós jantar", timeHint: "noite" },
  { id: "antes_dormir", label: "Antes de dormir", shortLabel: "Dormir", timeHint: "fim do dia" },
  { id: "madrugada", label: "Madrugada", shortLabel: "Madrugada", timeHint: "sono" },
  { id: "outro", label: "Outro", shortLabel: "Outro", timeHint: "livre" },
];

export function getPeriodLabel(period: string) {
  return periods.find((item) => item.id === period)?.label ?? period;
}
