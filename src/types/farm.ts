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
  seed_carrot: "🥕",
  seed_strawberry: "🍓",
  seed_sunflower: "🌻",
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
