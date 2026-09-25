"use client";

import { useCallback, useEffect, useState } from "react";
import { ModuleLayout } from "./Module";
import { MODULES, ModuleType } from "./modules.registry";

const STORAGE_KEY = "studytoolkit.workspace.v1";

export interface WorkspaceModule {
  /** Unique instance id (allows multiple of the same type). */
  id: string;
  type: ModuleType;
  layout: ModuleLayout;
}

interface PersistShape {
  modules: WorkspaceModule[];
}

// A pleasant starter arrangement for first-time users.
function defaultModules(): WorkspaceModule[] {
  const place = (
    type: ModuleType,
    x: number,
    y: number,
  ): WorkspaceModule => ({
    id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    layout: {
      x,
      y,
      width: MODULES[type].defaultSize.width,
      height: MODULES[type].defaultSize.height,
    },
  });
  return [
    place("tasks", 24, 24),
    place("timer", 388, 24),
    place("flashcards", 692, 24),
    place("upcoming", 24, 428),
    place("notes", 408, 428),
    place("statistics", 728, 340),
  ];
}

function load(): WorkspaceModule[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistShape;
    if (!parsed || !Array.isArray(parsed.modules)) return null;
    // Drop any modules whose type no longer exists in the registry.
    return parsed.modules.filter((m) => m.type in MODULES);
  } catch {
    return null;
  }
}

export function useWorkspace() {
  const [modules, setModules] = useState<WorkspaceModule[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = load();
    /* eslint-disable react-hooks/set-state-in-effect */
    setModules(stored ?? defaultModules());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist whenever modules change (after initial hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ modules } satisfies PersistShape),
      );
    } catch {
      /* ignore */
    }
  }, [modules, hydrated]);

  const addModule = useCallback((type: ModuleType) => {
    setModules((prev) => {
      const def = MODULES[type];
      // Cascade new modules slightly so they don't stack exactly.
      const offset = prev.length * 24;
      return [
        ...prev,
        {
          id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
          type,
          layout: {
            x: 24 + (offset % 240),
            y: 24 + (offset % 120),
            width: def.defaultSize.width,
            height: def.defaultSize.height,
          },
        },
      ];
    });
  }, []);

  const removeModule = useCallback((id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateLayout = useCallback((id: string, layout: ModuleLayout) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, layout } : m)),
    );
  }, []);

  const resetWorkspace = useCallback(() => {
    setModules(defaultModules());
  }, []);

  const replaceAll = useCallback((next: WorkspaceModule[]) => {
    setModules(next);
  }, []);

  return {
    modules,
    hydrated,
    addModule,
    removeModule,
    updateLayout,
    resetWorkspace,
    replaceAll,
  };
}
