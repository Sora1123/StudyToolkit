"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Theme = "system" | "light" | "dark";
export type Accent = "indigo" | "emerald" | "amber" | "rose";
export type FontFamily = "geist" | "inter" | "serif" | "mono";
export type FontSize = "sm" | "md" | "lg" | "xl";

export type DashboardSize =
  | { kind: "fit" }
  | { kind: "preset"; width: number; height: number }
  | { kind: "custom"; width: number; height: number };

export type NotesUnit = "words" | "chars";

export interface PomodoroCycle {
  focus: number; // minutes
  break: number; // minutes
  longBreak: number; // minutes
  rounds: number; // focus sessions before a long break
}

export interface Settings {
  theme: Theme;
  accent: Accent;
  fontFamily: FontFamily;
  fontSize: FontSize;
  /** UI language. Kept as a plain union to avoid importing the i18n module
      (which itself imports this settings module). */
  language: "en" | "ja";
  deskTexture: boolean;
  snapping: boolean;
  dashboardSize: DashboardSize;
  /** Initial board zoom, as a fraction (0.5–2.0 = 50%–200%). */
  defaultZoom: number;
  displayName: string;
  spaceTitle: string;
  notesUnit: NotesUnit;
  pomodoro: PomodoroCycle;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  accent: "indigo",
  fontFamily: "geist",
  fontSize: "md",
  language: "en",
  deskTexture: true,
  snapping: true,
  dashboardSize: { kind: "fit" },
  defaultZoom: 1,
  displayName: "Student",
  spaceTitle: "My Study Space",
  notesUnit: "words",
  pomodoro: { focus: 25, break: 5, longBreak: 15, rounds: 4 },
};

// --- UI metadata -----------------------------------------------------------

export const ACCENTS: Record<
  Accent,
  { label: string; base: string; hover: string; soft: string }
> = {
  indigo: { label: "Indigo", base: "#4f46e5", hover: "#4338ca", soft: "#eef0fe" },
  emerald: { label: "Emerald", base: "#059669", hover: "#047857", soft: "#ecfdf5" },
  amber: { label: "Amber", base: "#d97706", hover: "#b45309", soft: "#fef3e2" },
  rose: { label: "Rose", base: "#e11d48", hover: "#be123c", soft: "#ffe4e9" },
};

export const FONT_FAMILIES: Record<
  FontFamily,
  { label: string; stack: string }
> = {
  geist: {
    label: "Geist",
    stack: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },
  inter: {
    label: "Inter",
    stack: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  },
  serif: {
    label: "Serif",
    stack: "var(--font-lora), ui-serif, Georgia, serif",
  },
  mono: {
    label: "Mono",
    stack: "var(--font-geist-mono), ui-monospace, monospace",
  },
};

export const FONT_SIZES: Record<
  FontSize,
  { label: string; scale: number }
> = {
  sm: { label: "Small", scale: 0.9 },
  md: { label: "Default", scale: 1 },
  lg: { label: "Large", scale: 1.1 },
  xl: { label: "Extra large", scale: 1.2 },
};

export const DASHBOARD_PRESETS: { label: string; width: number; height: number }[] =
  [
    { label: "1280 × 800", width: 1280, height: 800 },
    { label: "1600 × 1000", width: 1600, height: 1000 },
    { label: "1920 × 1200", width: 1920, height: 1200 },
  ];

// Board zoom bounds (fractions). The default-zoom setting and the on-canvas
// zoom controls share these limits: 50%–200%.
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 2;

// --- Persistence -----------------------------------------------------------

const STORAGE_KEY = "studytoolkit.settings.v1";

function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      pomodoro: { ...DEFAULT_SETTINGS.pomodoro, ...(parsed.pomodoro ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// --- Apply to document -----------------------------------------------------

function applySettings(settings: Settings) {
  const root = document.documentElement;

  // Theme
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark =
    settings.theme === "dark" ||
    (settings.theme === "system" && prefersDark);
  root.classList.toggle("dark", isDark);

  // Accent
  const accent = ACCENTS[settings.accent];
  root.style.setProperty("--accent", accent.base);
  root.style.setProperty("--accent-hover", accent.hover);
  root.style.setProperty("--accent-soft", accent.soft);

  // Font family
  root.style.setProperty("--font-app", FONT_FAMILIES[settings.fontFamily].stack);

  // Font scale
  root.style.setProperty(
    "--font-scale",
    String(FONT_SIZES[settings.fontSize].scale),
  );

  // Desk texture
  root.classList.toggle("no-desk-texture", !settings.deskTexture);

  // Language (also drives the document lang attribute for a11y/SEO).
  root.setAttribute("lang", settings.language);
}

// --- Context ---------------------------------------------------------------

interface SettingsContextValue {
  settings: Settings;
  hydrated: boolean;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount and apply immediately.
  useEffect(() => {
    const loaded = loadSettings();
    /* eslint-disable react-hooks/set-state-in-effect */
    setSettings(loaded);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    applySettings(loaded);
  }, []);

  // Apply + persist whenever settings change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    applySettings(settings);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings, hydrated]);

  // Follow the system theme while "system" is selected.
  useEffect(() => {
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applySettings(settings);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [settings]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, hydrated, update, reset }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
