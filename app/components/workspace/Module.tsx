"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { GripVertical, MoreVertical, Trash2 } from "lucide-react";
import { ModuleDefinition } from "./modules.registry";
import { useT } from "@/app/components/i18n/I18nProvider";

/**
 * Masonry grid geometry. Both dimensions are discrete: width is a whole number
 * of columns; height a whole number of chunky ROW_UNIT tracks (separated by
 * ROW_GAP). Discrete steps make resizing snap cleanly and let
 * `grid-auto-flow: dense` pack short modules into the vertical gaps above
 * taller neighbours.
 */
export const ROW_UNIT = 64; // px per grid row track (chunky step)
export const ROW_GAP = 12; // px gap between tracks/columns (matches grid gap)
export const MIN_ROWS = 2;

/** Masonry-grid layout for a module: column span, discrete row span, order. */
export interface ModuleLayout {
  /** Number of grid columns the module spans (>= 1). */
  span: number;
  /** Number of chunky row tracks the module spans (discrete height). */
  rows: number;
  /** Position in the flow (ascending). */
  order: number;
}

/** Total pixel height of a given row span (tracks + inter-track gaps). */
export function pxForRows(rows: number): number {
  return rows * ROW_UNIT + (rows - 1) * ROW_GAP;
}

interface ModuleProps {
  def: ModuleDefinition;
  layout: ModuleLayout;
  /** Minimum discrete rows this module may shrink to. */
  minRows: number;
  /** Maximum columns available at the current screen width. */
  maxCols: number;
  /** Pixel width of a single grid column (for width-drag math). */
  colWidth: number;
  /** True while this module is the one being dragged for reorder. */
  dragging: boolean;
  onLayoutChange: (layout: ModuleLayout) => void;
  onRemove: () => void;
  /** Reorder drag lifecycle (pointer-based). */
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
}

export default function Module({
  def,
  layout,
  minRows,
  maxCols,
  colWidth,
  dragging,
  onLayoutChange,
  onRemove,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: ModuleProps) {
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const Content = def.component;
  const Icon = def.icon;

  // --- Resize (drag edges/corner) — snaps to whole row + column steps ------
  // Keep the latest layout/limits in a ref so the pointer handlers (attached
  // once per drag) always read current values without re-subscribing.
  const stateRef = useRef({ layout, minRows, maxCols, colWidth, onLayoutChange });
  useEffect(() => {
    stateRef.current = { layout, minRows, maxCols, colWidth, onLayoutChange };
  });

  const startResize = useCallback(
    (axis: "x" | "y" | "xy") => (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      let startRows = -1;
      let startSpan = -1;

      const move = (ev: PointerEvent) => {
        const s = stateRef.current;
        if (startRows < 0) {
          startRows = s.layout.rows;
          startSpan = s.layout.span;
        }
        let nextRows = s.layout.rows;
        let nextSpan = s.layout.span;
        if (axis === "y" || axis === "xy") {
          const deltaRows = Math.round((ev.clientY - startY) / (ROW_UNIT + ROW_GAP));
          nextRows = Math.max(s.minRows, startRows + deltaRows);
        }
        if ((axis === "x" || axis === "xy") && s.colWidth > 0) {
          const deltaCols = Math.round((ev.clientX - startX) / (s.colWidth + ROW_GAP));
          nextSpan = Math.min(Math.max(1, s.maxCols), Math.max(1, startSpan + deltaCols));
        }
        if (nextRows !== s.layout.rows || nextSpan !== s.layout.span) {
          s.onLayoutChange({ ...s.layout, rows: nextRows, span: nextSpan });
        }
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [],
  );

  // Close the options menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <motion.div
      layout
      onPointerEnter={() => onDragEnter()}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: dragging ? 0.6 : 1, scale: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`group/module relative flex h-full flex-col overflow-hidden rounded-xl border bg-surface shadow-sm transition-shadow hover:shadow-md ${
        dragging ? "border-accent ring-2 ring-accent/30" : "border-line"
      }`}
    >
      {/* Header — drag handle + hover-revealed controls */}
      <div
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
          if (e.button !== 0) return;
          onDragStart();
          const up = () => {
            onDragEnd();
            window.removeEventListener("pointerup", up);
          };
          window.addEventListener("pointerup", up);
        }}
        className="flex shrink-0 cursor-grab touch-none select-none items-center gap-2 border-b border-line px-3 py-2 active:cursor-grabbing"
      >
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-faint opacity-0 transition-opacity group-hover/module:opacity-100" />
        <Icon className="h-4 w-4 shrink-0 text-muted" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
          {def.title}
        </span>

        <div
          ref={menuRef}
          data-no-drag
          className="relative opacity-0 transition-opacity group-hover/module:opacity-100"
        >
          <button
            aria-label={t("module.options")}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded p-1 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-md border border-line bg-surface py-1 shadow-lg"
            >
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onRemove();
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-danger transition-colors hover:bg-danger-soft"
              >
                <Trash2 className="h-3.5 w-3.5" /> {t("module.remove")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {Content ? (
          <Content />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-sm text-faint">
            {t("common.comingSoon")}
          </div>
        )}
      </div>

      {/* Resize handles (discrete steps), revealed on hover. */}
      {/* Right edge → width (columns) */}
      <div
        data-no-drag
        onPointerDown={startResize("x")}
        role="separator"
        aria-label="Resize width"
        className="absolute inset-y-3 right-0 w-2 cursor-ew-resize opacity-0 transition-opacity group-hover/module:opacity-100"
      >
        <div className="ml-auto h-full w-0.5 rounded-full bg-line-strong" />
      </div>
      {/* Bottom edge → height (rows) */}
      <div
        data-no-drag
        onPointerDown={startResize("y")}
        role="separator"
        aria-label="Resize height"
        className="absolute inset-x-3 bottom-0 h-2 cursor-ns-resize opacity-0 transition-opacity group-hover/module:opacity-100"
      >
        <div className="mx-auto h-0.5 w-8 rounded-full bg-line-strong" />
      </div>
      {/* Bottom-right corner → both */}
      <div
        data-no-drag
        onPointerDown={startResize("xy")}
        role="separator"
        aria-label="Resize"
        className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize opacity-0 transition-opacity group-hover/module:opacity-100"
      >
        <div className="absolute bottom-1 right-1 h-2 w-2 rounded-br-sm border-b-2 border-r-2 border-line-strong" />
      </div>
    </motion.div>
  );
}
