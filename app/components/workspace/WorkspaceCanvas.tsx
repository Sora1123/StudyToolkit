"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LayoutGrid, Plus, Minus, Maximize } from "lucide-react";
import Module from "./Module";
import { MODULES } from "./modules.registry";
import { WorkspaceModule } from "./useWorkspace";
import { ModuleLayout } from "./Module";
import { Guides, Rect } from "./snapping";
import { DashboardSize } from "@/app/components/settings/SettingsProvider";

interface WorkspaceCanvasProps {
  modules: WorkspaceModule[];
  size: DashboardSize;
  snapping: boolean;
  onLayoutChange: (id: string, layout: ModuleLayout) => void;
  onRemove: (id: string) => void;
  onAddFirst: () => void;
}

const emptyGuides: Guides = { vertical: [], horizontal: [] };

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

const clampZoom = (z: number) =>
  Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));

export default function WorkspaceCanvas({
  modules,
  size,
  snapping,
  onLayoutChange,
  onRemove,
  onAddFirst,
}: WorkspaceCanvasProps) {
  const [guides, setGuides] = useState<Guides>(emptyGuides);
  const [zoom, setZoom] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const zoomIn = useCallback(() => setZoom((z) => clampZoom(z + ZOOM_STEP)), []);
  const zoomOut = useCallback(
    () => setZoom((z) => clampZoom(z - ZOOM_STEP)),
    [],
  );
  const zoomReset = useCallback(() => setZoom(1), []);

  // Measure the viewport so the board's logical size fills it exactly at 100%.
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

  // Ctrl/⌘ + wheel to zoom.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clampZoom(z - Math.sign(e.deltaY) * ZOOM_STEP));
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
            Build your study space
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            Add the tools you use most and arrange them however you like.
          </p>
          <button
            onClick={onAddFirst}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Plus className="h-4 w-4" /> Add your first module
          </button>
        </div>
      </div>
    );
  }

  // Board logical size:
  //  - "fit": exactly the measured viewport, so at 100% it fills the window.
  //  - preset/custom: the configured fixed size.
  const logical =
    size.kind === "fit"
      ? viewport
      : { width: size.width, height: size.height };

  const ready = logical.width > 0 && logical.height > 0;

  return (
    <div className="relative flex h-full min-h-[70vh] flex-1 flex-col">
      {/*
        The viewport is the fixed "one window": it fills the available area,
        never grows, and clips the board. Only the board inside scales on zoom.
        When zoomed past the window, the viewport can scroll/pan.
      */}
      <div
        ref={viewportRef}
        className={`no-scrollbar relative flex-1 rounded-xl border border-line ${
          zoom > 1 ? "overflow-auto" : "overflow-hidden"
        }`}
      >
        {ready && (
          <div
            className="desk-canvas relative origin-top-left"
            style={{
              width: logical.width,
              height: logical.height,
              transform: `scale(${zoom})`,
            }}
          >
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

            {/* Alignment guides (Canva-style) */}
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

      {/* Zoom controls (bottom-left, clear of the "+" FAB). */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5 shadow-sm">
        <button
          onClick={zoomOut}
          disabled={zoom <= ZOOM_MIN}
          aria-label="Zoom out"
          title="Zoom out"
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={zoomReset}
          aria-label="Reset zoom"
          title="Reset zoom"
          className="min-w-11 rounded-md px-1.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={zoomIn}
          disabled={zoom >= ZOOM_MAX}
          aria-label="Zoom in"
          title="Zoom in"
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="mx-0.5 h-4 w-px bg-line" />
        <button
          onClick={zoomReset}
          aria-label="Fit"
          title="Fit"
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
