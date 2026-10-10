import { addCareDrops } from "@/services/rewards";
import type { Measurement } from "@/types/measurement";
import { getTodayKey } from "@/utils/measurementCalculations";

export const STREAK_STORAGE_KEY = "glicotrack_streak_claims";
export const STREAK_CHANGED_EVENT = "glicotrack_streak_changed";

export type StreakMilestone = {
  days: number;
  reward: number;
};

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, reward: 25 },
  { days: 7, reward: 60 },
  { days: 14, reward: 150 },
  { days: 30, reward: 400 },
];

export type StreakInfo = {
  current: number;
  best: number;
  pending: StreakMilestone[];
  nextMilestone: StreakMilestone | null;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyStreakChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STREAK_CHANGED_EVENT));
  }
}

// Meio-dia evita que horário de verão empurre a data para o dia anterior.
function toDayNumber(dateKey: string) {
  return Math.round(new Date(`${dateKey}T12:00:00`).getTime() / 86_400_000);
}

export function getStreakDays(measurements: Measurement[]) {
  const days = Array.from(new Set(measurements.map((item) => item.date)))
    .sort()
    .map(toDayNumber)
    .filter((day) => Number.isFinite(day));

  if (days.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let index = 1; index < days.length; index += 1) {
    run = days[index] === days[index - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  // A sequência segue viva se o último registro foi hoje ou ontem.
  const today = toDayNumber(getTodayKey());
  const lastDay = days[days.length - 1];
  let current = 0;

  if (lastDay === today || lastDay === today - 1) {
    current = 1;
    for (let index = days.length - 1; index > 0; index -= 1) {
      if (days[index - 1] !== days[index] - 1) break;
      current += 1;
    }
  }

  return { current, best };
}

// Marcos resgatados valem só enquanto a sequência atual os sustenta: se ela
// quebrar, o jogador pode conquistá-los de novo no ciclo seguinte.
function getClaimedMilestones(currentStreak: number): number[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((value) => Number(value))
      .filter((days) => Number.isFinite(days) && days <= currentStreak);
  } catch {
    window.localStorage.removeItem(STREAK_STORAGE_KEY);
    return [];
  }
}

export function getStreakInfo(measurements: Measurement[]): StreakInfo {
  const { current, best } = getStreakDays(measurements);
  const claimed = getClaimedMilestones(current);

  return {
    current,
    best,
    pending: STREAK_MILESTONES.filter(
      (milestone) => current >= milestone.days && !claimed.includes(milestone.days),
    ),
    nextMilestone: STREAK_MILESTONES.find((milestone) => milestone.days > current) ?? null,
  };
}

export function claimStreakRewards(measurements: Measurement[]) {
  const { current } = getStreakDays(measurements);
  const claimed = getClaimedMilestones(current);
  const pending = STREAK_MILESTONES.filter(
    (milestone) => current >= milestone.days && !claimed.includes(milestone.days),
  );
  const total = pending.reduce((sum, milestone) => sum + milestone.reward, 0);

  if (total === 0) return { claimed: [], total: 0 };

  if (canUseStorage()) {
    const nextClaimed = [...claimed, ...pending.map((milestone) => milestone.days)];
    window.localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(nextClaimed));
  }

  addCareDrops(total);
  notifyStreakChanged();

  return { claimed: pending.map((milestone) => milestone.days), total };
}
