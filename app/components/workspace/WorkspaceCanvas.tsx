"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LayoutGrid, Plus, Minus, Maximize } from "lucide-react";
import Module from "./Module";
import { MODULES } from "./modules.registry";
import { WorkspaceModule } from "./useWorkspace";
import { ModuleLayout } from "./Module";
import { Guides, Rect } from "./snapping";
import { useT } from "@/app/components/i18n/I18nProvider";

interface WorkspaceCanvasProps {
  modules: WorkspaceModule[];
  snapping: boolean;
  /** Initial board zoom (fraction). Also the target for "reset zoom". */
  defaultZoom: number;
  onLayoutChange: (id: string, layout: ModuleLayout) => void;
  onRemove: (id: string) => void;
  onAddFirst: () => void;
}

const emptyGuides: Guides = { vertical: [], horizontal: [] };

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

const clampZoom = (z: number) => {
  // Guard against non-finite input (e.g. a wheel event with NaN deltaY during
  // a fast gesture), which would otherwise propagate to "NaN%".
  if (!Number.isFinite(z)) return ZOOM_MIN;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));
};

export default function WorkspaceCanvas({
  modules,
  snapping,
  defaultZoom,
  onLayoutChange,
  onRemove,
  onAddFirst,
}: WorkspaceCanvasProps) {
  const [guides, setGuides] = useState<Guides>(emptyGuides);
  const [zoom, setZoom] = useState(() => clampZoom(defaultZoom));
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const t = useT();

  const zoomIn = useCallback(() => setZoom((z) => clampZoom(z + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setZoom((z) => clampZoom(z - ZOOM_STEP)), []);
  const zoomReset = useCallback(() => {
    setZoom(clampZoom(defaultZoom));
    setPan({ x: 0, y: 0 });
  }, [defaultZoom]);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () =>
      setViewport({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Ctrl/Cmd + wheel = zoom the whole board.
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const dir = Math.sign(e.deltaY);
        // Ignore glitchy gesture events that report a non-finite/zero delta,
        // which previously turned the zoom (and its "%" readout) into NaN.
        if (!Number.isFinite(e.deltaY) || dir === 0) return;
        setZoom((z) => clampZoom(z - dir * ZOOM_STEP));
        return;
      }

      const dx = Number.isFinite(e.deltaX) ? e.deltaX : 0;
      const dy = Number.isFinite(e.deltaY) ? e.deltaY : 0;
      if (dx === 0 && dy === 0) return;

      // If the wheel is over a scrollable element inside a module (e.g. the
      // tasks list), let the browser scroll it and never pan the board — even
      // when it's at its top/bottom edge (no scroll chaining to the board).
      let node = e.target as HTMLElement | null;
      while (node && node !== el) {
        const style = getComputedStyle(node);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;
        const scrollableY =
          (overflowY === "auto" || overflowY === "scroll") &&
          node.scrollHeight > node.clientHeight;
        const scrollableX =
          (overflowX === "auto" || overflowX === "scroll") &&
          node.scrollWidth > node.clientWidth;
        if (scrollableY || scrollableX) return; // native scroll owns it
        node = node.parentElement;
      }

      // Otherwise pan the board.
      e.preventDefault();
      setPan((p) => ({ x: p.x - dx, y: p.y - dy }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  if (modules.length === 0) {
    return (
      <div className="desk-canvas flex h-full min-h-[60vh] flex-1 items-center justify-center rounded-xl border border-dashed border-line-strong">
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

  // Board = exactly the window size. No overflow — everything stays within the
  // visible window; modules cannot be placed outside it.
  const ready = viewport.width > 0;

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      {/* Fixed window — clips its contents; nothing renders outside it. */}
      <div
        ref={viewportRef}
        className="no-scrollbar relative flex-1 overflow-hidden rounded-xl border border-line"
      >
        {ready && (
          <div
            className="relative h-full w-full origin-center"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            {/* Dotted desk texture — oversized so the grid keeps covering the
                margins that become visible when the board is zoomed in. The
                inset is a multiple of the 22px dot pitch, so the dot phase
                stays aligned with the board origin (0,0) and module snapping. */}
            <div
              aria-hidden
              className="desk-canvas pointer-events-none absolute"
              style={{ inset: "-2200px" }}
            />
            {modules.map((m) => {
              const others: Rect[] = modules
                .filter((o) => o.id !== m.id)
                .map((o) => ({ ...o.layout }));
              return (
                <Module
                  key={m.id}
                  def={MODULES[m.type]}
                  layout={m.layout}
                  others={others}
                  snapping={snapping}
                  scale={zoom}
                  onLayoutChange={(layout) => onLayoutChange(m.id, layout)}
                  onRemove={() => onRemove(m.id)}
                  onGuides={setGuides}
                />
              );
            })}

            {guides.vertical.map((x, i) => (
              <div
                key={`v-${i}`}
                className="pointer-events-none absolute inset-y-0 z-[60] w-px bg-accent/70"
                style={{ left: x }}
              />
            ))}
            {guides.horizontal.map((y, i) => (
              <div
                key={`h-${i}`}
                className="pointer-events-none absolute inset-x-0 z-[60] h-px bg-accent/70"
                style={{ top: y }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Zoom controls — bottom center of the board. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-line bg-surface/95 p-0.5 shadow-sm backdrop-blur">
          <button
            onClick={zoomOut}
            disabled={zoom <= ZOOM_MIN}
            aria-label={t("zoom.out")}
            title={t("zoom.out")}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={zoomReset}
            aria-label={t("zoom.reset")}
            title={t("zoom.reset")}
            className="min-w-11 rounded-md px-1.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={zoom >= ZOOM_MAX}
            aria-label={t("zoom.in")}
            title={t("zoom.in")}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="mx-0.5 h-4 w-px bg-line" />
          <button
            onClick={zoomReset}
            aria-label={t("zoom.fit")}
            title={t("zoom.fit")}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
