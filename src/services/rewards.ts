import { TARGET_MAX, TARGET_MIN, type Measurement } from "@/types/measurement";

export const REWARDS_STORAGE_KEY = "glicotrack_user_rewards";
export const REWARDS_CHANGED_EVENT = "glicotrack_rewards_changed";

export type UserRewards = {
  careDrops: number;
  atp: number;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyRewardsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(REWARDS_CHANGED_EVENT));
  }
}

function normalizeRewards(value: unknown): UserRewards {
  if (!value || typeof value !== "object") return { careDrops: 0, atp: 0 };

  const item = value as Record<string, unknown>;
  const storedAmount = Number(item.atp ?? item.careDrops);
  const normalizedAmount =
    Number.isFinite(storedAmount) && storedAmount > 0 ? Math.floor(storedAmount) : 0;

  return {
    careDrops: normalizedAmount,
    atp: normalizedAmount,
  };
}

export function getUserRewards(): UserRewards {
  if (!canUseStorage()) return { careDrops: 0, atp: 0 };

  try {
    const raw = window.localStorage.getItem(REWARDS_STORAGE_KEY);
    if (!raw) return { careDrops: 0, atp: 0 };

    return normalizeRewards(JSON.parse(raw));
  } catch {
    window.localStorage.removeItem(REWARDS_STORAGE_KEY);
    return { careDrops: 0, atp: 0 };
  }
}

export function saveUserRewards(rewards: UserRewards) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(normalizeRewards(rewards)));
  notifyRewardsChanged();
}

export function addCareDrops(amount: number) {
  const rewardAmount = Math.max(0, Math.floor(amount));
  if (rewardAmount === 0) return getUserRewards();

  const currentRewards = getUserRewards();
  const nextRewards = {
    careDrops: currentRewards.careDrops + rewardAmount,
    atp: currentRewards.atp + rewardAmount,
  };

  saveUserRewards(nextRewards);
  return nextRewards;
}

export function spendAtp(amount: number) {
  const cost = Math.max(0, Math.floor(amount));
  const currentRewards = getUserRewards();

  if (cost === 0) {
    return {
      success: true,
      rewards: currentRewards,
    };
  }

  if (currentRewards.atp < cost) {
    return {
      success: false,
      rewards: currentRewards,
    };
  }

  const nextAmount = currentRewards.atp - cost;
  const nextRewards = {
    careDrops: nextAmount,
    atp: nextAmount,
  };

  saveUserRewards(nextRewards);

  return {
    success: true,
    rewards: nextRewards,
  };
}

export const REWARDED_SLOTS_STORAGE_KEY = "glicotrack_rewarded_slots";
export const MAX_REWARDED_RECORDS_PER_DAY = 4;

function getRecordSlot(record: Pick<Measurement, "date" | "period">) {
  return `${record.date}|${record.period}`;
}

function getRewardedSlots(): string[] {
  if (!canUseStorage()) return [];

  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(REWARDED_SLOTS_STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed) ? parsed.filter((slot) => typeof slot === "string") : [];
  } catch {
    window.localStorage.removeItem(REWARDED_SLOTS_STORAGE_KEY);
    return [];
  }
}

// Cada período do dia rende ATP uma única vez, até o limite diário. O registro
// fica guardado à parte, então apagar e registrar de novo não paga outra vez.
// Registros que já existiam contam como pagos (cobre quem tinha dados antes).
// Só leituras dentro do alvo rendem ATP, mas a fora do alvo ainda ocupa o
// período: apagar e trocar por um valor "bom" não paga.
export function claimGlucoseRecordReward(record: Measurement, existingRecords: Measurement[]) {
  const rewardedSlots = getRewardedSlots();
  const claimed = new Set([...rewardedSlots, ...existingRecords.map(getRecordSlot)]);
  const slot = getRecordSlot(record);
  const claimedToday = [...claimed].filter((item) => item.startsWith(`${record.date}|`)).length;

  if (claimed.has(slot) || claimedToday >= MAX_REWARDED_RECORDS_PER_DAY) {
    return { rewardAmount: 0, counted: false };
  }

  if (canUseStorage()) {
    window.localStorage.setItem(
      REWARDED_SLOTS_STORAGE_KEY,
      JSON.stringify([...rewardedSlots, slot]),
    );
  }

  if (record.glucoseValue < TARGET_MIN || record.glucoseValue > TARGET_MAX) {
    return { rewardAmount: 0, counted: true };
  }

  let reward = 10;

  if (record.insulinUnits && record.insulinUnits > 0) {
    reward += 5;
  }

  if (claimedToday + 1 === 3) {
    reward += 15;
  }

  addCareDrops(reward);

  return { rewardAmount: reward, counted: true };
}
