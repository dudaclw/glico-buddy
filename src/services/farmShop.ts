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

// Ordenadas da mais rápida/barata para a mais longa/cara: o preço é o que
// controla o ritmo da coleção, sem precisar de desbloqueio separado.
export const farmShopItems: FarmShopItem[] = [
  {
    id: "seed_lettuce",
    name: "Semente de Alface",
    type: "seed",
    price: 20,
    description: "Cresce rapidinho, boa para dias corridos.",
    growthRequiredRecords: 2,
  },
  {
    id: "seed_carrot",
    name: "Semente de Cenoura",
    type: "seed",
    price: 30,
    description: "Uma semente simples para começar sua horta.",
    growthRequiredRecords: 3,
  },
  {
    id: "seed_tomato",
    name: "Semente de Tomate",
    type: "seed",
    price: 45,
    description: "Gosta de sol e de rotina constante.",
    growthRequiredRecords: 4,
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
    id: "seed_corn",
    name: "Semente de Milho",
    type: "seed",
    price: 75,
    description: "Alto e firme, recompensa quem não falha.",
    growthRequiredRecords: 6,
  },
  {
    id: "seed_sunflower",
    name: "Semente de Girassol",
    type: "seed",
    price: 90,
    description: "Uma flor especial para deixar a fazenda mais bonita.",
    growthRequiredRecords: 7,
  },
  {
    id: "seed_pumpkin",
    name: "Semente de Abóbora",
    type: "seed",
    price: 110,
    description: "Pesada e paciente: leva tempo, mas impressiona.",
    growthRequiredRecords: 8,
  },
  {
    id: "seed_tulip",
    name: "Semente de Tulipa",
    type: "seed",
    price: 125,
    description: "Delicada e rara, só floresce com muita constância.",
    growthRequiredRecords: 9,
  },
  {
    id: "seed_watermelon",
    name: "Semente de Melancia",
    type: "seed",
    price: 150,
    description: "A joia da horta: a colheita mais longa da fazenda.",
    growthRequiredRecords: 10,
  },
  // Decorações são compradas uma única vez e ficam fixas no cenário.
  {
    id: "deco_fence",
    name: "Cerca de madeira",
    type: "decoration",
    price: 80,
    description: "Dá um contorno caprichado para a fazendinha.",
  },
  {
    id: "deco_flowers",
    name: "Canteiro de flores",
    type: "decoration",
    price: 120,
    description: "Um cantinho florido só para enfeitar.",
  },
  {
    id: "deco_basket",
    name: "Cesta de colheita",
    type: "decoration",
    price: 160,
    description: "Sinal de que esta fazenda já rendeu bastante.",
  },
  {
    id: "deco_fountain",
    name: "Fonte",
    type: "decoration",
    price: 220,
    description: "O som da água deixa a rotina mais leve.",
  },
  {
    id: "deco_chicken",
    name: "Galinha",
    type: "decoration",
    price: 300,
    description: "A moradora mais tagarela do terreno.",
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

  // Decoração é única: comprar de novo só gastaria ATP à toa.
  if (
    item.type === "decoration" &&
    currentInventory.some((inventoryItem) => inventoryItem.itemId === item.id)
  ) {
    return {
      success: false,
      message: `Você já tem ${item.name} na fazenda.`,
      inventory: currentInventory,
      atp: currentRewards.atp,
    };
  }

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
