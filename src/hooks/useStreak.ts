import { useCallback, useEffect, useState } from "react";
import {
  claimStreakRewards,
  getStreakInfo,
  STREAK_CHANGED_EVENT,
  type StreakInfo,
} from "@/services/streak";
import type { Measurement } from "@/types/measurement";

const EMPTY_STREAK: StreakInfo = { current: 0, best: 0, pending: [], nextMilestone: null };

export function useStreak(measurements: Measurement[]) {
  const [streak, setStreak] = useState<StreakInfo>(EMPTY_STREAK);

  const refreshStreak = useCallback(() => {
    setStreak(getStreakInfo(measurements));
  }, [measurements]);

  useEffect(() => {
    refreshStreak();

    window.addEventListener(STREAK_CHANGED_EVENT, refreshStreak);
    window.addEventListener("storage", refreshStreak);

    return () => {
      window.removeEventListener(STREAK_CHANGED_EVENT, refreshStreak);
      window.removeEventListener("storage", refreshStreak);
    };
  }, [refreshStreak]);

  const claimRewards = useCallback(() => {
    const result = claimStreakRewards(measurements);
    refreshStreak();
    return result;
  }, [measurements, refreshStreak]);

  return { streak, claimRewards, refreshStreak };
}
