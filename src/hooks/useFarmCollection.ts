import { useCallback, useEffect, useState } from "react";
import {
  FARM_COLLECTION_CHANGED_EVENT,
  getFarmCollection,
  type FarmCollection,
} from "@/services/farmCollection";

export function useFarmCollection() {
  const [collection, setCollection] = useState<FarmCollection>({});

  const refreshCollection = useCallback(() => {
    setCollection(getFarmCollection());
  }, []);

  useEffect(() => {
    refreshCollection();

    window.addEventListener(FARM_COLLECTION_CHANGED_EVENT, refreshCollection);
    window.addEventListener("storage", refreshCollection);

    return () => {
      window.removeEventListener(FARM_COLLECTION_CHANGED_EVENT, refreshCollection);
      window.removeEventListener("storage", refreshCollection);
    };
  }, [refreshCollection]);

  return {
    collection,
    refreshCollection,
  };
}
