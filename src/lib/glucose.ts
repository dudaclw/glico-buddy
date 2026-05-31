export type Period = "jejum" | "antes_cafe" | "depois_cafe" | "antes_almoco" | "depois_almoco" | "antes_jantar" | "depois_jantar" | "madrugada";

export const PERIODS: { value: Period; label: string; emoji: string }[] = [
  { value: "jejum", label: "Jejum", emoji: "🌅" },
  { value: "antes_cafe", label: "Antes do café", emoji: "☕" },
  { value: "depois_cafe", label: "Depois do café", emoji: "🥐" },
  { value: "antes_almoco", label: "Antes do almoço", emoji: "🍽️" },
  { value: "depois_almoco", label: "Depois do almoço", emoji: "🍰" },
  { value: "antes_jantar", label: "Antes do jantar", emoji: "🌆" },
  { value: "depois_jantar", label: "Depois do jantar", emoji: "🌙" },
  { value: "madrugada", label: "Madrugada", emoji: "🌌" },
];

export function periodLabel(value: string) {
  return PERIODS.find((p) => p.value === value)?.label ?? value;
}

export function periodEmoji(value: string) {
  return PERIODS.find((p) => p.value === value)?.emoji ?? "🩸";
}

export type GlucoseStatus = "low" | "normal" | "high";

export function classify(value: number, min = 70, max = 180): GlucoseStatus {
  if (value < min) return "low";
  if (value > max) return "high";
  return "normal";
}

export function statusColor(s: GlucoseStatus) {
  if (s === "low") return "text-warning";
  if (s === "high") return "text-destructive";
  return "text-success";
}

export function statusBg(s: GlucoseStatus) {
  if (s === "low") return "bg-warning/15 text-warning-foreground border-warning/30";
  if (s === "high") return "bg-destructive/10 text-destructive border-destructive/30";
  return "bg-success/15 text-success-foreground border-success/30";
}

export function statusLabel(s: GlucoseStatus) {
  return s === "low" ? "Hipoglicemia" : s === "high" ? "Hiperglicemia" : "Na meta";
}

export const INSULIN_TYPES = [
  "Rápida (regular)",
  "Ultrarrápida (Lispro/Aspart/Glulisina)",
  "NPH",
  "Lenta (Glargina/Detemir/Degludeca)",
  "Pré-misturada",
  "Outra",
];
