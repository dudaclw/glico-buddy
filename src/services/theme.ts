export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const THEME_CHANGED_EVENT = "theme_changed";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isAppTheme(value: unknown): value is AppTheme {
  return value === "light" || value === "dark";
}

function updateMeta(name: string, content: string) {
  if (typeof document === "undefined") return;
  const meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (meta) meta.content = content;
}

export function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;
  const isDark = theme === "dark";

  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = isDark ? "dark" : "only light";

  if (body) {
    body.classList.remove("light", "dark");
    body.classList.add(theme);
    body.style.colorScheme = isDark ? "dark" : "only light";
  }

  updateMeta("color-scheme", isDark ? "dark" : "only light");
  updateMeta("supported-color-schemes", isDark ? "dark" : "light");
  updateMeta("theme-color", isDark ? "#1E1B16" : "#8CCAF7");

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
