"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { LayoutGrid, Plus } from "lucide-react";
import Module, {
  ModuleLayout,
  ROW_UNIT,
  ROW_GAP,
  MIN_ROWS,
} from "./Module";
import { MODULES } from "./modules.registry";
import { WorkspaceModule } from "./useWorkspace";
import { useT } from "@/app/components/i18n/I18nProvider";

interface WorkspaceCanvasProps {
  modules: WorkspaceModule[];
  onLayoutChange: (id: string, layout: ModuleLayout) => void;
  onRemove: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  onAddFirst: () => void;
}

/** Discrete minimum rows for a module type, honoring its minHeight. */
function minRowsFor(minHeight: number | undefined, fallback: number): number {
  const h = minHeight ?? fallback;
  const rows = Math.round((h + ROW_GAP) / (ROW_UNIT + ROW_GAP));
  return Math.max(MIN_ROWS, rows);
}

/** Responsive column count matching the grid's Tailwind breakpoints. */
function columnsForWidth(w: number): number {
  if (w >= 1280) return 4; // xl
  if (w >= 1024) return 3; // lg
  if (w >= 640) return 2; // sm
  return 1;
}

/**
 * Dashboard grid — a conventional, Pinterest-style masonry layout. Modules flow
 * into responsive columns with small uniform gaps (no dot texture, no pan/zoom).
 * Both dimensions are discrete + draggable: width is a whole number of columns
 * (up to however many columns fit at the current width), height a whole number
 * of chunky row tracks. `grid-auto-flow: dense` packs short modules into the
 * vertical gaps above taller neighbours. Dragging a header reorders.
 */
export default function WorkspaceCanvas({
  modules,
  onLayoutChange,
  onRemove,
  onReorder,
  onAddFirst,
}: WorkspaceCanvasProps) {
  const t = useT();
  const [dragId, setDragId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(1);
  const [colWidth, setColWidth] = useState(0);

  // Measure the grid to know the live column count + one column's pixel width,
  // so a horizontal resize drag can be converted into discrete column steps.
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const c = columnsForWidth(w);
      setCols(c);
      // Total width = c*colWidth + (c-1)*gap  ->  solve colWidth.
      setColWidth((w - (c - 1) * ROW_GAP) / c);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (modules.length === 0) {
    return (
      <div className="flex h-full min-h-[60vh] flex-1 items-center justify-center rounded-xl border border-dashed border-line-strong">
        <div className="max-w-sm px-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-accent shadow-sm">
            <LayoutGrid className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-semibold text-text">
            {t("workspace.buildTitle")}
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            {t("workspace.buildSubtitle")}
          </p>
          <button
            onClick={onAddFirst}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Plus className="h-4 w-4" /> {t("workspace.addFirst")}
          </button>
        </div>
      </div>
    );
  }

  const ordered = [...modules].sort((a, b) => a.layout.order - b.layout.order);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      style={{
        gridAutoFlow: "dense",
        gridAutoRows: `${ROW_UNIT}px`,
        gap: `${ROW_GAP}px`,
      }}
      onPointerUp={() => setDragId(null)}
    >
      {ordered.map((m) => {
        const def = MODULES[m.type];
        // A module can't span more columns than currently exist.
        const span = Math.min(m.layout.span, cols);
        return (
          <div
            key={m.id}
            style={{
              gridColumn: `span ${span}`,
              gridRow: `span ${m.layout.rows}`,
            }}
          >
            <Module
              def={def}
              layout={m.layout}
              minRows={minRowsFor(def.minHeight, def.defaultSize.height)}
              maxCols={cols}
              colWidth={colWidth}
              dragging={dragId === m.id}
              onLayoutChange={(layout) => onLayoutChange(m.id, layout)}
              onRemove={() => onRemove(m.id)}
              onDragStart={() => setDragId(m.id)}
              onDragEnter={() => {
                if (dragId && dragId !== m.id) onReorder(dragId, m.id);
              }}
              onDragEnd={() => setDragId(null)}
            />
          </div>
        );
      })}
    </div>
  );
}
