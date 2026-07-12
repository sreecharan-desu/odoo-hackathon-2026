import { useCallback, useEffect, useState } from "react";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "transitops-theme";
const TRANSITION_CLASS = "theme-transition";
const DARK_CLASS = "dark";

function getSystemTheme(): ResolvedTheme {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function readStoredPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  // Product default: dark B&W chrome (light is opt-in via toggle)
  return "dark";
}

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") return getSystemTheme();
  return pref;
}

function applyTheme(resolved: ResolvedTheme, withTransition = true): void {
  const html = document.documentElement;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (withTransition && !prefersReduced) {
    html.classList.add(TRANSITION_CLASS);
    setTimeout(() => html.classList.remove(TRANSITION_CLASS), 350);
  }

  if (resolved === "dark") {
    html.classList.add(DARK_CLASS);
  } else {
    html.classList.remove(DARK_CLASS);
  }
}

export interface UseThemeReturn {
  /** Current user preference: light | dark | system */
  preference: ThemePreference;
  /** Resolved theme actually applied: light | dark */
  resolved: ResolvedTheme;
  /** Flip between light and dark (ignores system) */
  toggle: () => void;
  /** Set an explicit preference */
  setTheme: (pref: ThemePreference) => void;
  /** Is dark mode currently active */
  isDark: boolean;
}

export function useTheme(): UseThemeReturn {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPreference);
  const resolved = resolveTheme(preference);

  // Apply on mount (without transition — FOUC script already handled first paint)
  useEffect(() => {
    applyTheme(resolved, false);
  }, []);

  // Re-apply when preference changes (with transition)
  useEffect(() => {
    applyTheme(resolved, true);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* ignore */
    }
  }, [preference, resolved]);

  // Sync with system preference changes when in "system" mode
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(resolveTheme("system"), true);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const toggle = useCallback(() => {
    setPreference((prev) => {
      const cur = resolveTheme(prev);
      return cur === "dark" ? "light" : "dark";
    });
  }, []);

  const setTheme = useCallback((pref: ThemePreference) => {
    setPreference(pref);
  }, []);

  return { preference, resolved, toggle, setTheme, isDark: resolved === "dark" };
}
