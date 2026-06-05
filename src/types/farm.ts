export type PlantType = "carrot" | "strawberry" | "sunflower" | "corn" | "pumpkin";

export interface Plant {
  id: string;
  type: PlantType;
  growthStage: number;
  maxStage: 5;
}

export interface Farm {
  totalMeasurements: number;
  unlockedPlants: PlantType[];
  currentPlant: Plant;
  harvestedPlants: PlantType[];
}

export type PlantDefinition = {
  type: PlantType;
  label: string;
  icon: string;
  unlockAt: number;
};

export type FarmAdvanceResult = {
  farm: Farm;
  grewPlant: Plant;
  harvestedPlant?: Plant;
  unlockedPlants: PlantType[];
};

export const PLANT_MAX_STAGE = 5;

export const PLANT_CATALOG: PlantDefinition[] = [
  { type: "carrot", label: "Cenoura", icon: "🥕", unlockAt: 3 },
  { type: "strawberry", label: "Morango", icon: "🍓", unlockAt: 10 },
  { type: "sunflower", label: "Girassol", icon: "🌻", unlockAt: 25 },
  { type: "corn", label: "Milho", icon: "🌽", unlockAt: 50 },
  { type: "pumpkin", label: "Abóbora", icon: "🎃", unlockAt: 100 },
];

export const GROWTH_STAGE_ICONS = ["🌰", "🌱", "🌿", "🌼"] as const;

export function getPlantDefinition(type: PlantType) {
  return PLANT_CATALOG.find((plant) => plant.type === type) ?? PLANT_CATALOG[0];
}

export function getPlantStageIcon(plant: Plant) {
  if (plant.growthStage >= plant.maxStage) return getPlantDefinition(plant.type).icon;
  return GROWTH_STAGE_ICONS[Math.max(0, plant.growthStage - 1)] ?? GROWTH_STAGE_ICONS[0];
}
