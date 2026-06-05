import {
  PLANT_CATALOG,
  PLANT_MAX_STAGE,
  type Farm,
  type FarmAdvanceResult,
  type Plant,
  type PlantType,
} from "@/types/farm";

export const FARM_STORAGE_KEY = "glicotrack_farm";
export const FARM_CHANGED_EVENT = "glicotrack_farm_changed";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function notifyFarmChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FARM_CHANGED_EVENT));
  }
}

function getUnlockedPlants(totalMeasurements: number): PlantType[] {
  return PLANT_CATALOG.filter((plant) => totalMeasurements >= plant.unlockAt).map(
    (plant) => plant.type,
  );
}

function choosePlantType(unlockedPlants: PlantType[]) {
  const availablePlants = unlockedPlants.length > 0 ? unlockedPlants : ["carrot" as PlantType];
  return availablePlants[Math.floor(Math.random() * availablePlants.length)] ?? "carrot";
}

function createPlant(type: PlantType, growthStage = 0): Plant {
  return {
    id: createId(),
    type,
    growthStage,
    maxStage: PLANT_MAX_STAGE,
  };
}

export function createEmptyFarm(): Farm {
  return {
    totalMeasurements: 0,
    unlockedPlants: [],
    currentPlant: {
      id: "initial-seed",
      type: "carrot",
      growthStage: 0,
      maxStage: PLANT_MAX_STAGE,
    },
    harvestedPlants: [],
  };
}

function normalizePlant(value: unknown): Plant | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const type = item.type;
  const growthStage = Number(item.growthStage);
  const isKnownType = PLANT_CATALOG.some((plant) => plant.type === type);

  if (
    typeof item.id !== "string" ||
    !isKnownType ||
    !Number.isFinite(growthStage) ||
    growthStage < 0
  ) {
    return null;
  }

  return {
    id: String(item.id),
    type: type as PlantType,
    growthStage: Math.min(PLANT_MAX_STAGE, Math.max(0, Math.round(growthStage))),
    maxStage: PLANT_MAX_STAGE,
  };
}

function normalizeFarm(value: unknown): Farm | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const totalMeasurements = Number(item.totalMeasurements);
  const currentPlant = normalizePlant(item.currentPlant);

  if (!Number.isFinite(totalMeasurements) || totalMeasurements < 0 || !currentPlant) {
    return null;
  }

  const unlockedPlants = Array.isArray(item.unlockedPlants)
    ? item.unlockedPlants.filter((type): type is PlantType =>
        PLANT_CATALOG.some((plant) => plant.type === type),
      )
    : [];
  const harvestedPlants = Array.isArray(item.harvestedPlants)
    ? item.harvestedPlants.filter((type): type is PlantType =>
        PLANT_CATALOG.some((plant) => plant.type === type),
      )
    : [];

  return {
    totalMeasurements: Math.round(totalMeasurements),
    unlockedPlants,
    currentPlant,
    harvestedPlants,
  };
}

function buildFarmFromMeasurements(measurementCount: number): Farm {
  const totalMeasurements = Math.max(0, measurementCount);
  const unlockedPlants = getUnlockedPlants(totalMeasurements);
  const harvestedCount = Math.floor(totalMeasurements / PLANT_MAX_STAGE);
  const growthStage = totalMeasurements % PLANT_MAX_STAGE;
  const availablePlants = unlockedPlants.length > 0 ? unlockedPlants : ["carrot" as PlantType];
  const harvestedPlants = Array.from({ length: Math.min(4, harvestedCount) }, (_, index) => {
    return availablePlants[index % availablePlants.length] ?? "carrot";
  });

  return {
    totalMeasurements,
    unlockedPlants,
    currentPlant: createPlant(choosePlantType(unlockedPlants), growthStage),
    harvestedPlants,
  };
}

function saveFarm(farm: Farm) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(FARM_STORAGE_KEY, JSON.stringify(farm));
  notifyFarmChanged();
}

export function getFarm(measurementCount = 0): Farm {
  if (!canUseStorage()) {
    return measurementCount > 0 ? buildFarmFromMeasurements(measurementCount) : createEmptyFarm();
  }

  try {
    const raw = window.localStorage.getItem(FARM_STORAGE_KEY);
    if (!raw) {
      const farm = buildFarmFromMeasurements(measurementCount);
      saveFarm(farm);
      return farm;
    }

    const parsed = JSON.parse(raw);
    const farm = normalizeFarm(parsed);
    if (!farm) {
      const rebuiltFarm = buildFarmFromMeasurements(measurementCount);
      saveFarm(rebuiltFarm);
      return rebuiltFarm;
    }

    if (measurementCount > farm.totalMeasurements) {
      const reconciledFarm = buildFarmFromMeasurements(measurementCount);
      saveFarm(reconciledFarm);
      return reconciledFarm;
    }

    return {
      ...farm,
      unlockedPlants: getUnlockedPlants(farm.totalMeasurements),
    };
  } catch {
    const rebuiltFarm = buildFarmFromMeasurements(measurementCount);
    saveFarm(rebuiltFarm);
    return rebuiltFarm;
  }
}

export function advanceFarmAfterMeasurement(measurementCount = 0): FarmAdvanceResult {
  const farm = getFarm(measurementCount);
  const totalMeasurements = farm.totalMeasurements + 1;
  const unlockedPlants = getUnlockedPlants(totalMeasurements);
  const newlyUnlockedPlants = unlockedPlants.filter((type) => !farm.unlockedPlants.includes(type));
  const grewPlant: Plant = {
    ...farm.currentPlant,
    growthStage: Math.min(farm.currentPlant.growthStage + 1, PLANT_MAX_STAGE),
  };
  const harvestedPlant = grewPlant.growthStage >= PLANT_MAX_STAGE ? grewPlant : undefined;

  const nextFarm: Farm = {
    totalMeasurements,
    unlockedPlants,
    currentPlant: harvestedPlant ? createPlant(choosePlantType(unlockedPlants), 0) : grewPlant,
    harvestedPlants: harvestedPlant
      ? [harvestedPlant.type, ...farm.harvestedPlants].slice(0, 4)
      : farm.harvestedPlants,
  };

  saveFarm(nextFarm);

  return {
    farm: nextFarm,
    grewPlant,
    harvestedPlant,
    unlockedPlants: newlyUnlockedPlants,
  };
}
