export type PeriodId =
  | "jejum"
  | "cafe_manha"
  | "antes_cafe"
  | "depois_cafe"
  | "antes_almoco"
  | "depois_almoco"
  | "cafe_tarde"
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
  glucose: number;
  glucoseValue: number;
  insulinUnits?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type MeasurementInput = Omit<
  Measurement,
  "id" | "createdAt" | "updatedAt" | "glucose"
> & {
  glucose?: number;
};

export const TARGET_MIN = 70;
export const TARGET_MAX = 180;

export const periods: Array<{
  id: PeriodId;
  label: string;
  shortLabel: string;
  timeHint: string;
}> = [
  { id: "jejum", label: "Jejum", shortLabel: "Jejum", timeHint: "ao acordar" },
  { id: "cafe_manha", label: "Café da manhã", shortLabel: "Café", timeHint: "manhã" },
  { id: "antes_almoco", label: "Antes do almoço", shortLabel: "Pré almoço", timeHint: "meio-dia" },
  { id: "depois_almoco", label: "Após almoço", shortLabel: "Pós almoço", timeHint: "tarde" },
  { id: "cafe_tarde", label: "Café da tarde", shortLabel: "Café tarde", timeHint: "tarde" },
  { id: "antes_jantar", label: "Antes do jantar", shortLabel: "Pré jantar", timeHint: "noite" },
  { id: "depois_jantar", label: "Após jantar", shortLabel: "Pós jantar", timeHint: "noite" },
  { id: "antes_dormir", label: "Antes de dormir", shortLabel: "Dormir", timeHint: "fim do dia" },
  { id: "madrugada", label: "Madrugada", shortLabel: "Madrugada", timeHint: "sono" },
];

export function getPeriodLabel(period: string) {
  const legacyLabels: Record<string, string> = {
    antes_cafe: "Antes do café",
    depois_cafe: "Depois do café",
    outro: "Outro",
  };
  return periods.find((item) => item.id === period)?.label ?? legacyLabels[period] ?? period;
}
