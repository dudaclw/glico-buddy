import { useCallback, useEffect, useState } from "react";
import {
  buyFarmShopItem,
  FARM_INVENTORY_CHANGED_EVENT,
  getFarmInventory,
  type FarmInventoryItem,
} from "@/services/farmShop";

export function useFarmShop() {
  const [inventory, setInventory] = useState<FarmInventoryItem[]>([]);

  const refreshInventory = useCallback(() => {
    setInventory(getFarmInventory());
  }, []);

  useEffect(() => {
    refreshInventory();

    window.addEventListener(FARM_INVENTORY_CHANGED_EVENT, refreshInventory);
    window.addEventListener("storage", refreshInventory);

    return () => {
      window.removeEventListener(FARM_INVENTORY_CHANGED_EVENT, refreshInventory);
      window.removeEventListener("storage", refreshInventory);
    };
  }, [refreshInventory]);

  const buyItem = useCallback(
    (itemId: string) => {
      const result = buyFarmShopItem(itemId);
      refreshInventory();
      return result;
    },
    [refreshInventory],
  );

  return {
    inventory,
    buyItem,
    refreshInventory,
  };
}
