import type { Measurement, MeasurementInput, PeriodId } from "@/types/measurement";
import { addCareDrops, calculateGlucoseRecordReward } from "@/services/rewards";

export const STORAGE_KEY = "glicotrack_measurements";
export const MEASUREMENTS_CHANGED_EVENT = "glicotrack_measurements_changed";

export type MeasurementCreateResult = {
  measurement: Measurement;
  rewardAmount: number;
};

const periodIds: PeriodId[] = [
  "jejum",
  "cafe_manha",
  "antes_cafe",
  "depois_cafe",
  "antes_almoco",
  "depois_almoco",
  "cafe_tarde",
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
  const glucoseValue = Number(item.glucoseValue ?? item.glucose);
  const insulinUnits =
    item.insulinUnits === undefined || item.insulinUnits === ""
      ? undefined
      : Number(item.insulinUnits);
  const createdAt = typeof item.createdAt === "string" ? item.createdAt : "";
  const createdAtDate = createdAt ? createdAt.slice(0, 10) : "";
  const createdAtTime = createdAt ? createdAt.slice(11, 16) : "";
  const date = isDateKey(item.date) ? String(item.date) : createdAtDate;
  const time = item.time || createdAtTime;

  if (
    typeof item.id !== "string" ||
    !isDateKey(date) ||
    !isTimeKey(time) ||
    !isPeriodId(item.period) ||
    !Number.isFinite(glucoseValue) ||
    glucoseValue <= 0 ||
    (insulinUnits !== undefined && (!Number.isFinite(insulinUnits) || insulinUnits < 0)) ||
    !createdAt
  ) {
    return null;
  }

  return {
    id: String(item.id),
    date,
    time: time ? String(time) : undefined,
    period: item.period,
    glucose: glucoseValue,
    glucoseValue,
    insulinUnits,
    notes: typeof item.notes === "string" && item.notes.trim() ? item.notes : undefined,
    rewardGranted: item.rewardGranted === true,
    createdAt,
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

export function createMeasurement(input: MeasurementInput): MeasurementCreateResult {
  const now = new Date().toISOString();
  const measurement: Measurement = {
    ...input,
    id: createId(),
    glucose: input.glucose ?? input.glucoseValue,
    glucoseValue: input.glucoseValue,
    time: input.time || undefined,
    notes: input.notes?.trim() || undefined,
    rewardGranted: false,
    createdAt: now,
  };
  const existingMeasurements = getMeasurements();
  const nextMeasurements = [measurement, ...existingMeasurements];
  const recordsOfTheDay = nextMeasurements.filter((item) => item.date === measurement.date);
  const rewardAmount = calculateGlucoseRecordReward(measurement, recordsOfTheDay);
  const rewardedMeasurement = {
    ...measurement,
    rewardGranted: true,
  };

  saveMeasurements([rewardedMeasurement, ...existingMeasurements]);
  addCareDrops(rewardAmount);

  return {
    measurement: rewardedMeasurement,
    rewardAmount,
  };
}

export function updateMeasurement(id: string, input: MeasurementInput): Measurement | null {
  const measurements = getMeasurements();
  const existing = measurements.find((item) => item.id === id);
  if (!existing) return null;

  const updated: Measurement = {
    ...existing,
    ...input,
    glucose: input.glucose ?? input.glucoseValue,
    glucoseValue: input.glucoseValue,
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
