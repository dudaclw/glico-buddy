export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "dailyglico_theme";
export const THEME_CHANGED_EVENT = "dailyglico_theme_changed";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isAppTheme(value: unknown): value is AppTheme {
  return value === "light" || value === "dark";
}

export function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.appTheme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function getStoredTheme(): AppTheme {
  if (!canUseStorage()) return "light";

  const theme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isAppTheme(theme) ? theme : "light";
}

export function setStoredTheme(theme: AppTheme) {
  if (canUseStorage()) {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
  applyTheme(theme);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
  }
}
