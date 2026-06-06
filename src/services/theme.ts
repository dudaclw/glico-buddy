export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const THEME_CHANGED_EVENT = "theme_changed";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isAppTheme(value: unknown): value is AppTheme {
  return value === "light" || value === "dark";
}

export function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;

  root.classList.remove("light", "dark");
  root.classList.add(theme);

  if (body) {
    body.classList.remove("light", "dark");
    body.classList.add(theme);
  }

  if (canUseStorage()) {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

export function getStoredTheme(): AppTheme {
  if (!canUseStorage()) return "light";

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) || "light";
  return isAppTheme(savedTheme) ? savedTheme : "light";
}

export function setStoredTheme(theme: AppTheme) {
  applyTheme(theme);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
  }
}
