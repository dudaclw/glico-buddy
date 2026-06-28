export const PROFILE_STORAGE_KEY = "glicotrack_profile";
export const PROFILE_CHANGED_EVENT = "glicotrack_profile_changed";

export type UserProfile = {
  farmName: string;
};

export const DEFAULT_FARM_NAME = "Minha Fazenda";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyProfileChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT));
  }
}

function normalizeProfile(value: unknown): UserProfile {
  if (!value || typeof value !== "object") return { farmName: DEFAULT_FARM_NAME };

  const item = value as Record<string, unknown>;
  const farmName = typeof item.farmName === "string" ? item.farmName.trim() : "";

  return {
    farmName: farmName || DEFAULT_FARM_NAME,
  };
}

export function getUserProfile(): UserProfile {
  if (!canUseStorage()) return { farmName: DEFAULT_FARM_NAME };

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return { farmName: DEFAULT_FARM_NAME };

    return normalizeProfile(JSON.parse(raw));
  } catch {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    return { farmName: DEFAULT_FARM_NAME };
  }
}

export function saveUserProfile(profile: UserProfile) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalizeProfile(profile)));
  notifyProfileChanged();
}
