import { useCallback, useEffect, useState } from "react";
import { FARM_CHANGED_EVENT, createEmptyFarm, getFarm } from "@/services/farm";
import type { Farm } from "@/types/farm";

export function useFarm() {
  const [farm, setFarm] = useState<Farm>(() => createEmptyFarm());

  const refreshFarm = useCallback(() => {
    setFarm(getFarm());
  }, []);

  useEffect(() => {
    refreshFarm();
    window.addEventListener(FARM_CHANGED_EVENT, refreshFarm);
    window.addEventListener("storage", refreshFarm);

    return () => {
      window.removeEventListener(FARM_CHANGED_EVENT, refreshFarm);
      window.removeEventListener("storage", refreshFarm);
    };
  }, [refreshFarm]);

  return {
    farm,
    refreshFarm,
  };
}
