import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  setStoredTheme,
  THEME_CHANGED_EVENT,
  type AppTheme,
} from "@/services/theme";

export function useTheme() {
  const [theme, setThemeState] = useState<AppTheme>("light");

  const refreshTheme = useCallback(() => {
    const nextTheme = getStoredTheme();
    applyTheme(nextTheme);
    setThemeState(nextTheme);
  }, []);

  useEffect(() => {
    refreshTheme();
    window.addEventListener(THEME_CHANGED_EVENT, refreshTheme);
    window.addEventListener("storage", refreshTheme);

    return () => {
      window.removeEventListener(THEME_CHANGED_EVENT, refreshTheme);
      window.removeEventListener("storage", refreshTheme);
    };
  }, [refreshTheme]);

  const setTheme = useCallback((nextTheme: AppTheme) => {
    setStoredTheme(nextTheme);
    setThemeState(nextTheme);
  }, []);

  return {
    theme,
    setTheme,
  };
}
