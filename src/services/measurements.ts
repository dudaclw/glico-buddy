import type { Measurement, MeasurementInput, PeriodId } from "@/types/measurement";

export const STORAGE_KEY = "glicotrack_measurements";
export const MEASUREMENTS_CHANGED_EVENT = "glicotrack_measurements_changed";

const periodIds: PeriodId[] = [
  "jejum",
  "antes_cafe",
  "depois_cafe",
  "antes_almoco",
  "depois_almoco",
  "antes_jantar",
  "depois_jantar",
  "antes_dormir",
  "madrugada",
  "outro",
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isPeriodId(value: unknown): value is PeriodId {
  return typeof value === "string" && periodIds.includes(value as PeriodId);
}

function isDateKey(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTimeKey(value: unknown) {
  return (
    value === undefined ||
    value === "" ||
    (typeof value === "string" && /^\d{2}:\d{2}$/.test(value))
  );
}

function normalizeMeasurement(value: unknown): Measurement | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const glucoseValue = Number(item.glucoseValue);
  const insulinUnits =
    item.insulinUnits === undefined || item.insulinUnits === ""
      ? undefined
      : Number(item.insulinUnits);

  if (
    typeof item.id !== "string" ||
    !isDateKey(item.date) ||
    !isTimeKey(item.time) ||
    !isPeriodId(item.period) ||
    !Number.isFinite(glucoseValue) ||
    glucoseValue <= 0 ||
    (insulinUnits !== undefined && (!Number.isFinite(insulinUnits) || insulinUnits < 0)) ||
    typeof item.createdAt !== "string"
  ) {
    return null;
  }

  return {
    id: String(item.id),
    date: String(item.date),
    time: item.time ? String(item.time) : undefined,
    period: item.period,
    glucoseValue,
    insulinUnits,
    notes: typeof item.notes === "string" && item.notes.trim() ? item.notes : undefined,
    createdAt: item.createdAt,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
  };
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function notifyMeasurementsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MEASUREMENTS_CHANGED_EVENT));
  }
}

export function compareMeasurementsDesc(a: Measurement, b: Measurement) {
  return `${b.date}T${b.time || "00:00"}`.localeCompare(`${a.date}T${a.time || "00:00"}`);
}

export function getMeasurements(): Measurement[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return parsed
      .map(normalizeMeasurement)
      .filter((item): item is Measurement => Boolean(item))
      .sort(compareMeasurementsDesc);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function saveMeasurements(measurements: Measurement[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(measurements.sort(compareMeasurementsDesc)),
  );
  notifyMeasurementsChanged();
}

export function createMeasurement(input: MeasurementInput): Measurement {
  const now = new Date().toISOString();
  const measurement: Measurement = {
    ...input,
    id: createId(),
    time: input.time || undefined,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
  };

  saveMeasurements([measurement, ...getMeasurements()]);
  return measurement;
}

export function updateMeasurement(id: string, input: MeasurementInput): Measurement | null {
  const measurements = getMeasurements();
  const existing = measurements.find((item) => item.id === id);
  if (!existing) return null;

  const updated: Measurement = {
    ...existing,
    ...input,
    time: input.time || undefined,
    notes: input.notes?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  saveMeasurements(measurements.map((item) => (item.id === id ? updated : item)));
  return updated;
}

export function deleteMeasurement(id: string) {
  saveMeasurements(getMeasurements().filter((item) => item.id !== id));
}

export function clearMeasurements() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  notifyMeasurementsChanged();
}
