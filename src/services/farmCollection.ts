export const FARM_COLLECTION_STORAGE_KEY = "glicotrack_farm_collection";
export const FARM_COLLECTION_CHANGED_EVENT = "glicotrack_farm_collection_changed";

export type FarmCollection = Record<string, number>;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyCollectionChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FARM_COLLECTION_CHANGED_EVENT));
  }
}

function normalizeCollection(value: unknown): FarmCollection {
  if (!value || typeof value !== "object") return {};

  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, count]) => Number.isFinite(Number(count)) && Number(count) > 0,
  );

  return Object.fromEntries(
    entries.map(([seedItemId, count]) => [seedItemId, Math.floor(Number(count))]),
  );
}

export function getFarmCollection(): FarmCollection {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(FARM_COLLECTION_STORAGE_KEY);
    if (!raw) return {};

    return normalizeCollection(JSON.parse(raw));
  } catch {
    window.localStorage.removeItem(FARM_COLLECTION_STORAGE_KEY);
    return {};
  }
}

function saveFarmCollection(collection: FarmCollection) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(FARM_COLLECTION_STORAGE_KEY, JSON.stringify(collection));
  notifyCollectionChanged();
}

export function recordHarvest(seedItemId: string) {
  const collection = getFarmCollection();
  const nextCollection = { ...collection, [seedItemId]: (collection[seedItemId] ?? 0) + 1 };
  saveFarmCollection(nextCollection);
  return nextCollection;
}
