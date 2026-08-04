import {
  FARM_PLOT_COUNT,
  getFarmPlantStage,
  type Farm,
  type FarmAdvanceResult,
  type FarmPlant,
  type FarmPlantingResult,
  type FarmPlot,
  type FarmPlotStatus,
  type FarmPlantStage,
} from "@/types/farm";
import {
  getFarmInventory,
  getFarmShopItem,
  saveFarmInventory,
  type FarmInventoryItem,
} from "@/services/farmShop";

export const FARM_STORAGE_KEY = "glicotrack_farm";
export const FARM_CHANGED_EVENT = "glicotrack_farm_changed";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function notifyFarmChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FARM_CHANGED_EVENT));
  }
}

function createInitialPlots(): FarmPlot[] {
  return Array.from({ length: FARM_PLOT_COUNT }, (_, index) => ({
    id: `plot_${index + 1}`,
    plantId: null,
    status: "empty",
  }));
}

export function createEmptyFarm(totalMeasurements = 0): Farm {
  return {
    totalMeasurements,
    plots: createInitialPlots(),
    plants: [],
  };
}

function normalizePlot(value: unknown): FarmPlot | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const status = item.status;

  if (typeof item.id !== "string" || !["empty", "growing", "completed"].includes(String(status))) {
    return null;
  }

  return {
    id: item.id,
    plantId: typeof item.plantId === "string" ? item.plantId : null,
    status: status as FarmPlotStatus,
  };
}

function normalizePlant(value: unknown): FarmPlant | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const currentGrowth = Number(item.currentGrowth);
  const growthRequiredRecords = Number(item.growthRequiredRecords);
  const stage = item.stage;

  if (
    typeof item.id !== "string" ||
    typeof item.seedItemId !== "string" ||
    typeof item.plotId !== "string" ||
    typeof item.name !== "string" ||
    typeof item.plantedAt !== "string" ||
    !Number.isFinite(currentGrowth) ||
    currentGrowth < 0 ||
    !Number.isFinite(growthRequiredRecords) ||
    growthRequiredRecords <= 0 ||
    !["seed", "sprout", "growing", "completed"].includes(String(stage))
  ) {
    return null;
  }

  return {
    id: item.id,
    seedItemId: item.seedItemId,
    plotId: item.plotId,
    name: item.name,
    currentGrowth: Math.min(Math.round(currentGrowth), Math.round(growthRequiredRecords)),
    growthRequiredRecords: Math.round(growthRequiredRecords),
    stage: stage as FarmPlantStage,
    plantedAt: item.plantedAt,
    completedAt: typeof item.completedAt === "string" ? item.completedAt : undefined,
  };
}

function normalizeFarm(value: unknown): Farm | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const totalMeasurements = Number(item.totalMeasurements);

  if (!Number.isFinite(totalMeasurements) || totalMeasurements < 0) {
    return null;
  }

  const normalizedPlants = Array.isArray(item.plants)
    ? item.plants.map(normalizePlant).filter((plant): plant is FarmPlant => Boolean(plant))
    : [];
  const normalizedPlots = Array.isArray(item.plots)
    ? item.plots.map(normalizePlot).filter((plot): plot is FarmPlot => Boolean(plot))
    : [];
  const plots = createInitialPlots().map((defaultPlot) => {
    const storedPlot = normalizedPlots.find((plot) => plot.id === defaultPlot.id);
    if (!storedPlot) return defaultPlot;

    const linkedPlant = storedPlot.plantId
      ? normalizedPlants.find((plant) => plant.id === storedPlot.plantId)
      : null;

    if (!linkedPlant) return defaultPlot;

    return {
      ...storedPlot,
      status: linkedPlant.stage === "completed" ? "completed" : "growing",
    };
  });
  const plotIds = new Set(plots.map((plot) => plot.id));
  const plants = normalizedPlants.filter((plant) => plotIds.has(plant.plotId));

  return {
    totalMeasurements: Math.round(totalMeasurements),
    plots,
    plants,
  };
}

function saveFarm(farm: Farm) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(FARM_STORAGE_KEY, JSON.stringify(farm));
  notifyFarmChanged();
}

export function getFarm(totalMeasurements = 0): Farm {
  if (!canUseStorage()) {
    return createEmptyFarm(totalMeasurements);
  }

  try {
    const raw = window.localStorage.getItem(FARM_STORAGE_KEY);
    if (!raw) {
      const farm = createEmptyFarm(totalMeasurements);
      saveFarm(farm);
      return farm;
    }

    const parsed = JSON.parse(raw);
    const farm = normalizeFarm(parsed);
    if (!farm) {
      const emptyFarm = createEmptyFarm(totalMeasurements);
      saveFarm(emptyFarm);
      return emptyFarm;
    }

    const nextFarm = {
      ...farm,
      totalMeasurements: Math.max(farm.totalMeasurements, totalMeasurements),
    };

    if (nextFarm.totalMeasurements !== farm.totalMeasurements) {
      saveFarm(nextFarm);
    }

    return nextFarm;
  } catch {
    const emptyFarm = createEmptyFarm(totalMeasurements);
    saveFarm(emptyFarm);
    return emptyFarm;
  }
}

function removeSeedFromInventory(inventory: FarmInventoryItem[], seedItemId: string) {
  return inventory
    .map((item) => (item.itemId === seedItemId ? { ...item, quantity: item.quantity - 1 } : item))
    .filter((item) => item.quantity > 0);
}

function getSeedPlantName(seedName: string) {
  return seedName.replace(/^Semente de\s+/i, "").trim() || seedName;
}

export function plantSeedOnPlot(seedItemId: string, plotId: string): FarmPlantingResult {
  const farm = getFarm();
  const plot = farm.plots.find((currentPlot) => currentPlot.id === plotId);

  if (!plot) {
    return {
      success: false,
      message: "Canteiro não encontrado.",
      farm,
    };
  }

  if (plot.status !== "empty" || plot.plantId) {
    return {
      success: false,
      message: "Este canteiro já possui uma planta.",
      farm,
    };
  }

  const inventory = getFarmInventory();
  const inventoryItem = inventory.find(
    (item) => item.itemId === seedItemId && item.type === "seed",
  );

  if (!inventoryItem || inventoryItem.quantity <= 0) {
    return {
      success: false,
      message: "Você não possui essa semente no inventário.",
      farm,
    };
  }

  const seedConfig = getFarmShopItem(seedItemId);

  if (!seedConfig || seedConfig.type !== "seed" || !seedConfig.growthRequiredRecords) {
    return {
      success: false,
      message: "Configuração da semente não encontrada.",
      farm,
    };
  }

  const newPlant: FarmPlant = {
    id: createId("plant"),
    seedItemId: seedConfig.id,
    plotId: plot.id,
    name: getSeedPlantName(seedConfig.name),
    currentGrowth: 0,
    growthRequiredRecords: seedConfig.growthRequiredRecords,
    stage: "seed",
    plantedAt: new Date().toISOString(),
  };
  const nextFarm: Farm = {
    ...farm,
    plots: farm.plots.map((currentPlot) =>
      currentPlot.id === plot.id
        ? {
            ...currentPlot,
            plantId: newPlant.id,
            status: "growing",
          }
        : currentPlot,
    ),
    plants: [...farm.plants, newPlant],
  };

  saveFarmInventory(removeSeedFromInventory(inventory, seedItemId));
  saveFarm(nextFarm);

  return {
    success: true,
    message: `${newPlant.name} plantada com sucesso!`,
    farm: nextFarm,
  };
}

export function harvestPlot(plotId: string): FarmPlantingResult {
  const farm = getFarm();
  const plot = farm.plots.find((currentPlot) => currentPlot.id === plotId);

  if (!plot || plot.status !== "completed" || !plot.plantId) {
    return {
      success: false,
      message: "Este canteiro ainda não está pronto para colher.",
      farm,
    };
  }

  const plant = farm.plants.find((currentPlant) => currentPlant.id === plot.plantId);
  const nextFarm: Farm = {
    ...farm,
    plots: farm.plots.map((currentPlot) =>
      currentPlot.id === plotId
        ? { id: currentPlot.id, plantId: null, status: "empty" }
        : currentPlot,
    ),
    plants: farm.plants.filter((currentPlant) => currentPlant.id !== plot.plantId),
  };

  saveFarm(nextFarm);

  return {
    success: true,
    message: plant
      ? `${plant.name} colhida! O canteiro está livre para plantar de novo.`
      : "Canteiro colhido!",
    farm: nextFarm,
  };
}

export function progressFarmPlantsAfterGlucoseRecord(): FarmAdvanceResult {
  const farm = getFarm();
  const now = new Date().toISOString();
  const progressedPlants: FarmPlant[] = [];
  const completedPlants: FarmPlant[] = [];
  const plants = farm.plants.map((plant) => {
    if (plant.stage === "completed") return plant;

    const nextGrowth = Math.min(plant.currentGrowth + 1, plant.growthRequiredRecords);
    const nextStage = getFarmPlantStage(nextGrowth, plant.growthRequiredRecords);
    const nextPlant: FarmPlant = {
      ...plant,
      currentGrowth: nextGrowth,
      stage: nextStage,
      completedAt: nextStage === "completed" ? (plant.completedAt ?? now) : plant.completedAt,
    };

    progressedPlants.push(nextPlant);

    if (nextStage === "completed" && plant.stage !== "completed") {
      completedPlants.push(nextPlant);
    }

    return nextPlant;
  });
  const completedPlantIds = new Set(completedPlants.map((plant) => plant.id));
  const nextFarm: Farm = {
    ...farm,
    totalMeasurements: farm.totalMeasurements + 1,
    plants,
    plots: farm.plots.map((plot) =>
      plot.plantId && completedPlantIds.has(plot.plantId)
        ? {
            ...plot,
            status: "completed",
          }
        : plot,
    ),
  };

  saveFarm(nextFarm);

  return {
    farm: nextFarm,
    progressedPlants,
    completedPlants,
  };
}
