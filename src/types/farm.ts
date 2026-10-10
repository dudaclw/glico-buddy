export type FarmPlotStatus = "empty" | "growing" | "completed";
export type FarmPlantStage = "seed" | "sprout" | "growing" | "completed";

export type FarmPlot = {
  id: string;
  plantId: string | null;
  status: FarmPlotStatus;
};

export type FarmPlant = {
  id: string;
  seedItemId: string;
  plotId: string;
  name: string;
  currentGrowth: number;
  growthRequiredRecords: number;
  stage: FarmPlantStage;
  plantedAt: string;
  completedAt?: string;
};

export interface Farm {
  totalMeasurements: number;
  plots: FarmPlot[];
  plants: FarmPlant[];
}

export type FarmPlantingResult = {
  success: boolean;
  message: string;
  farm: Farm;
  rewardAmount?: number;
};

export type FarmAdvanceResult = {
  farm: Farm;
  progressedPlants: FarmPlant[];
  completedPlants: FarmPlant[];
};

export const FARM_PLOT_COUNT = 5;
export const FARM_MAX_PLOT_COUNT = 7;

// Preço do próximo canteiro, do 6º em diante.
const FARM_PLOT_PRICES: Record<number, number> = {
  6: 150,
  7: 300,
};

export function getNextPlotPrice(currentPlotCount: number): number | null {
  return FARM_PLOT_PRICES[currentPlotCount + 1] ?? null;
}

export const FARM_STAGE_LABELS: Record<FarmPlantStage, string> = {
  seed: "Semente",
  sprout: "Brotinho",
  growing: "Crescendo",
  completed: "Completa",
};

export const FARM_STAGE_ICONS: Record<FarmPlantStage, string> = {
  seed: "🌱",
  sprout: "🌿",
  growing: "🌾",
  completed: "🌼",
};

export const SEED_COMPLETED_ICONS: Record<string, string> = {
  seed_lettuce: "🥬",
  seed_carrot: "🥕",
  seed_tomato: "🍅",
  seed_strawberry: "🍓",
  seed_corn: "🌽",
  seed_sunflower: "🌻",
  seed_pumpkin: "🎃",
  seed_tulip: "🌷",
  seed_watermelon: "🍉",
};

export const DECORATION_ICONS: Record<string, string> = {
  deco_fence: "🪵",
  deco_flowers: "🌼",
  deco_basket: "🧺",
  deco_fountain: "⛲",
  deco_chicken: "🐓",
};

export function getFarmPlantStage(currentGrowth: number, growthRequiredRecords: number) {
  if (growthRequiredRecords <= 0 || currentGrowth >= growthRequiredRecords) return "completed";

  const progressRatio = currentGrowth / growthRequiredRecords;
  if (progressRatio >= 0.66) return "growing";
  if (progressRatio >= 0.33) return "sprout";
  return "seed";
}

export function getFarmPlantIcon(plant: FarmPlant) {
  if (plant.stage === "completed") {
    return SEED_COMPLETED_ICONS[plant.seedItemId] ?? FARM_STAGE_ICONS.completed;
  }

  return FARM_STAGE_ICONS[plant.stage];
}
