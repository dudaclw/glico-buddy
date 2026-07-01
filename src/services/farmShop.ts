import { getUserRewards, spendAtp } from "@/services/rewards";

export const FARM_INVENTORY_STORAGE_KEY = "glicotrack_farm_inventory";
export const FARM_INVENTORY_CHANGED_EVENT = "glicotrack_farm_inventory_changed";

export type FarmShopItemType = "seed" | "decoration" | "upgrade";

export type FarmShopItem = {
  id: string;
  name: string;
  type: FarmShopItemType;
  price: number;
  description: string;
  growthRequiredRecords?: number;
};

export type FarmInventoryItem = {
  itemId: string;
  quantity: number;
  type: FarmShopItemType;
};

export type FarmShopPurchaseResult = {
  success: boolean;
  message: string;
  inventory: FarmInventoryItem[];
  atp: number;
};

export const farmShopItems: FarmShopItem[] = [
  {
    id: "seed_carrot",
    name: "Semente de Cenoura",
    type: "seed",
    price: 30,
    description: "Uma semente simples para começar sua horta.",
    growthRequiredRecords: 3,
  },
  {
    id: "seed_strawberry",
    name: "Semente de Morango",
    type: "seed",
    price: 60,
    description: "Uma planta delicada que precisa de mais cuidado.",
    growthRequiredRecords: 5,
  },
  {
    id: "seed_sunflower",
    name: "Semente de Girassol",
    type: "seed",
    price: 90,
    description: "Uma flor especial para deixar a fazenda mais bonita.",
    growthRequiredRecords: 7,
  },
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyInventoryChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FARM_INVENTORY_CHANGED_EVENT));
  }
}

function normalizeInventory(value: unknown): FarmInventoryItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rawItem = item as Record<string, unknown>;
      const shopItem = farmShopItems.find((candidate) => candidate.id === rawItem.itemId);
      const quantity = Number(rawItem.quantity);

      if (!shopItem || !Number.isFinite(quantity) || quantity <= 0) return null;

      return {
        itemId: shopItem.id,
        quantity: Math.floor(quantity),
        type: shopItem.type,
      };
    })
    .filter((item): item is FarmInventoryItem => Boolean(item));
}

export function getFarmInventory(): FarmInventoryItem[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(FARM_INVENTORY_STORAGE_KEY);
    if (!raw) return [];

    return normalizeInventory(JSON.parse(raw));
  } catch {
    window.localStorage.removeItem(FARM_INVENTORY_STORAGE_KEY);
    return [];
  }
}

export function saveFarmInventory(inventory: FarmInventoryItem[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    FARM_INVENTORY_STORAGE_KEY,
    JSON.stringify(normalizeInventory(inventory)),
  );
  notifyInventoryChanged();
}

export function getFarmShopItem(itemId: string) {
  return farmShopItems.find((item) => item.id === itemId) ?? null;
}

export function buyFarmShopItem(itemId: string): FarmShopPurchaseResult {
  const item = getFarmShopItem(itemId);

  if (!item) {
    throw new Error("Item não encontrado.");
  }

  const currentRewards = getUserRewards();
  const currentInventory = getFarmInventory();

  if (currentRewards.atp < item.price) {
    return {
      success: false,
      message: "ATP insuficiente para comprar este item.",
      inventory: currentInventory,
      atp: currentRewards.atp,
    };
  }

  const spendResult = spendAtp(item.price);

  if (!spendResult.success) {
    return {
      success: false,
      message: "ATP insuficiente para comprar este item.",
      inventory: currentInventory,
      atp: spendResult.rewards.atp,
    };
  }

  const existingItem = currentInventory.find((inventoryItem) => inventoryItem.itemId === item.id);
  const nextInventory = existingItem
    ? currentInventory.map((inventoryItem) =>
        inventoryItem.itemId === item.id
          ? { ...inventoryItem, quantity: inventoryItem.quantity + 1 }
          : inventoryItem,
      )
    : [
        ...currentInventory,
        {
          itemId: item.id,
          quantity: 1,
          type: item.type,
        },
      ];

  saveFarmInventory(nextInventory);

  return {
    success: true,
    message: `${item.name} comprada com sucesso!`,
    inventory: nextInventory,
    atp: spendResult.rewards.atp,
  };
}
