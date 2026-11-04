"use client";

import { useCallback, useEffect, useState } from "react";
import { ModuleLayout, ROW_UNIT, ROW_GAP, MIN_ROWS } from "./Module";
import { MODULES, ModuleType } from "./modules.registry";

// v3: masonry layout uses discrete row spans ({span, rows, order}). The chunky
// row unit means resizing snaps to whole steps and short modules pack into the
// vertical gaps above taller neighbours. A new key avoids interpreting stale
// pixel-height (v2) or absolute x/y (v1) data.
const STORAGE_KEY = "studytoolkit.workspace.v3";

export interface WorkspaceModule {
  /** Unique instance id (allows multiple of the same type). */
  id: string;
  type: ModuleType;
  layout: ModuleLayout;
}

interface PersistShape {
  modules: WorkspaceModule[];
}

/** Convert a pixel height into a whole number of chunky row units. */
export function rowsForHeight(px: number): number {
  // Each row after the first also consumes a gap, so invert that when solving
  // rows from a target pixel height: px ≈ rows*ROW_UNIT + (rows-1)*ROW_GAP.
  const rows = Math.round((px + ROW_GAP) / (ROW_UNIT + ROW_GAP));
  return Math.max(MIN_ROWS, rows);
}

/** Default row span for a freshly added module of a given type. */
function defaultRows(type: ModuleType): number {
  return rowsForHeight(MODULES[type].defaultSize.height);
}

/** Minimum row span honoring a module's minHeight. */
function minRows(type: ModuleType): number {
  return rowsForHeight(MODULES[type].minHeight ?? MODULES[type].defaultSize.height);
}

// A pleasant starter arrangement for first-time users. Order defines flow;
// span is columns (1 or 2); rows is the discrete height span.
function defaultModules(): WorkspaceModule[] {
  const spec: { type: ModuleType; span: 1 | 2 }[] = [
    { type: "tasks", span: 1 },
    { type: "timer", span: 1 },
    { type: "flashcards", span: 1 },
    { type: "upcoming", span: 1 },
    { type: "notes", span: 2 },
    { type: "statistics", span: 1 },
    { type: "calculator", span: 1 },
  ];
  return spec.map((s, i) => ({
    id: `${s.type}-${Math.random().toString(36).slice(2, 8)}`,
    type: s.type,
    layout: {
      span: s.span,
      rows: defaultRows(s.type),
      order: i,
    },
  }));
}

/** Coerce an unknown persisted module into the current layout shape. */
function normalize(m: unknown, index: number): WorkspaceModule | null {
  if (!m || typeof m !== "object") return null;
  const rec = m as Record<string, unknown>;
  if (typeof rec.id !== "string" || typeof rec.type !== "string") return null;
  if (!(rec.type in MODULES)) return null;
  const type = rec.type as ModuleType;
  const layout = (rec.layout ?? {}) as Record<string, unknown>;
  const span =
    typeof layout.span === "number" && Number.isFinite(layout.span)
      ? Math.max(1, Math.round(layout.span))
      : 1;
  // Accept a discrete `rows` value, or fall back to converting a legacy pixel
  // `height`, or the type's default.
  let rows: number;
  if (typeof layout.rows === "number" && Number.isFinite(layout.rows)) {
    rows = Math.round(layout.rows);
  } else if (typeof layout.height === "number" && Number.isFinite(layout.height)) {
    rows = rowsForHeight(layout.height);
  } else {
    rows = defaultRows(type);
  }
  rows = Math.max(minRows(type), rows);
  const order =
    typeof layout.order === "number" && Number.isFinite(layout.order)
      ? layout.order
      : index;
  return { id: rec.id, type, layout: { span, rows, order } };
}

function load(): WorkspaceModule[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistShape;
    if (!parsed || !Array.isArray(parsed.modules)) return null;
    const out = parsed.modules
      .map((m, i) => normalize(m, i))
      .filter((m): m is WorkspaceModule => m !== null);
    return out;
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
      const maxOrder = prev.reduce((m, x) => Math.max(m, x.layout.order), -1);
      return [
        ...prev,
        {
          id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
          type,
          layout: {
            span: 1,
            rows: defaultRows(type),
            order: maxOrder + 1,
          },
        },
      ];
    });
  }, []);

  const removeModule = useCallback((id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateLayout = useCallback((id: string, layout: ModuleLayout) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, layout } : m)));
  }, []);

  /** Move a module to a new position in the flow, renumbering order values. */
  const reorder = useCallback((fromId: string, toId: string) => {
    setModules((prev) => {
      if (fromId === toId) return prev;
      const ordered = [...prev].sort((a, b) => a.layout.order - b.layout.order);
      const fromIdx = ordered.findIndex((m) => m.id === fromId);
      const toIdx = ordered.findIndex((m) => m.id === toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = ordered.splice(fromIdx, 1);
      ordered.splice(toIdx, 0, moved);
      return ordered.map((m, i) => ({ ...m, layout: { ...m.layout, order: i } }));
    });
  }, []);

  const resetWorkspace = useCallback(() => {
    setModules(defaultModules());
  }, []);

  const replaceAll = useCallback((next: WorkspaceModule[]) => {
    // Normalize incoming (e.g. imported) modules to the current shape.
    setModules(
      next
        .map((m, i) => normalize(m, i))
        .filter((m): m is WorkspaceModule => m !== null),
    );
  }, []);

  return {
    modules,
    hydrated,
    addModule,
    removeModule,
    updateLayout,
    reorder,
    resetWorkspace,
    replaceAll,
  };
}
