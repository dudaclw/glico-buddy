import { useCallback, useEffect, useState } from "react";
import { getUserRewards, REWARDS_CHANGED_EVENT, type UserRewards } from "@/services/rewards";

export function useRewards() {
  const [rewards, setRewards] = useState<UserRewards>(() => ({ careDrops: 0, atp: 0 }));

  const refreshRewards = useCallback(() => {
    setRewards(getUserRewards());
  }, []);

  useEffect(() => {
    refreshRewards();

    window.addEventListener(REWARDS_CHANGED_EVENT, refreshRewards);
    window.addEventListener("storage", refreshRewards);

    return () => {
      window.removeEventListener(REWARDS_CHANGED_EVENT, refreshRewards);
      window.removeEventListener("storage", refreshRewards);
    };
  }, [refreshRewards]);

  return {
    rewards,
    refreshRewards,
  };
}
