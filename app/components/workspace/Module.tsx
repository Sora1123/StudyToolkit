"use client";

import { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { GripVertical, MoreVertical, X } from "lucide-react";
import { ModuleDefinition } from "./modules.registry";
import {
  Guides,
  Rect,
  resolveOverlap,
  snapDrag,
  snapResize,
} from "./snapping";

export interface ModuleLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ModuleProps {
  def: ModuleDefinition;
  layout: ModuleLayout;
  /** Rects of all *other* modules, for alignment + overlap snapping. */
  others: Rect[];
  /** When false, drag/resize are free (no snap, guides, or overlap resolve). */
  snapping: boolean;
  /** Current board zoom, so pointer deltas and react-rnd resize are corrected. */
  scale: number;
  onLayoutChange: (layout: ModuleLayout) => void;
  onRemove: () => void;
  onGuides: (guides: Guides) => void;
}

const emptyGuides: Guides = { vertical: [], horizontal: [] };

export default function Module({
  def,
  layout,
  others,
  snapping,
  scale,
  onLayoutChange,
  onRemove,
  onGuides,
}: ModuleProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const Content = def.component;
  const Icon = def.icon;

  // --- Custom magnetic drag ------------------------------------------------
  // We own the position during a drag and set it directly from pointer math,
  // running it through snapDrag. Because nothing else fights this value, the
  // module sits pinned on the snap line within the detent zone (smooth magnet).
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  // Holds the active window listeners so we can detach without self-reference.
  const listenersRef = useRef<{
    move: (e: PointerEvent) => void;
    up: () => void;
  } | null>(null);

  const pos = dragPos ?? { x: layout.x, y: layout.y };

  const onHeaderPointerDown = (e: React.PointerEvent) => {
    // Don't start a drag from the options menu button.
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    if (e.button !== 0) return;
    e.preventDefault();

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: layout.x,
      originY: layout.y,
    };
    setDragPos({ x: layout.x, y: layout.y });

    const move = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      // Divide by zoom because the board is CSS-scaled.
      const rawX = d.originX + (ev.clientX - d.startX) / scale;
      const rawY = d.originY + (ev.clientY - d.startY) / scale;

      if (!snapping) {
        setDragPos({ x: rawX, y: rawY });
        return;
      }
      const moving: Rect = {
        x: rawX,
        y: rawY,
        width: layout.width,
        height: layout.height,
      };
      const { x, y, guides } = snapDrag(moving, others);
      onGuides(guides);
      setDragPos({ x, y });
    };

    const up = () => {
      if (listenersRef.current) {
        window.removeEventListener("pointermove", listenersRef.current.move);
        window.removeEventListener("pointerup", listenersRef.current.up);
        listenersRef.current = null;
      }
      onGuides(emptyGuides);
      const d = dragRef.current;
      dragRef.current = null;
      setDragPos((current) => {
        if (d && current) {
          const moving: Rect = {
            x: current.x,
            y: current.y,
            width: layout.width,
            height: layout.height,
          };
          const finalRect = snapping ? resolveOverlap(moving, others) : moving;
          onLayoutChange({
            ...layout,
            x: Math.max(0, finalRect.x),
            y: Math.max(0, finalRect.y),
          });
        }
        return null;
      });
    };

    listenersRef.current = { move, up };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // Detach any active drag listeners on unmount.
  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        window.removeEventListener("pointermove", listenersRef.current.move);
        window.removeEventListener("pointerup", listenersRef.current.up);
        listenersRef.current = null;
      }
    };
  }, []);

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
    <Rnd
      size={{ width: layout.width, height: layout.height }}
      position={pos}
      // Dragging is handled by our custom magnetic pointer logic below.
      disableDragging
      onResize={(_e, _dir, ref, _delta, position) => {
        if (!snapping) return;
        const { guides } = snapResize(
          position,
          ref.offsetWidth,
          ref.offsetHeight,
          others,
        );
        onGuides(guides);
      }}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        if (!snapping) {
          onLayoutChange({
            x: position.x,
            y: position.y,
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          });
          return;
        }
        const { width, height } = snapResize(
          position,
          ref.offsetWidth,
          ref.offsetHeight,
          others,
        );
        onGuides(emptyGuides);
        onLayoutChange({
          x: position.x,
          y: position.y,
          width,
          height,
        });
      }}
      minWidth={def.minWidth ?? 220}
      minHeight={def.minHeight ?? 180}
      bounds="parent"
      scale={scale}
      className="group/module"
      resizeHandleClasses={{
        bottomRight:
          "!h-4 !w-4 opacity-0 transition-opacity group-hover/module:opacity-100",
      }}
      resizeHandleComponent={{
        bottomRight: (
          <div className="flex h-full w-full items-end justify-end p-0.5">
            <div className="h-2.5 w-2.5 rounded-br-sm border-b-2 border-r-2 border-line-strong" />
          </div>
        ),
      }}
    >
      <div
        className={`flex h-full w-full flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow group-hover/module:shadow-[0_4px_16px_rgba(0,0,0,0.06)] ${
          dragPos ? "shadow-[0_8px_24px_rgba(0,0,0,0.10)]" : ""
        }`}
      >
        {/* Header — drag handle + hover-revealed controls */}
        <div
          onPointerDown={onHeaderPointerDown}
          className={`flex touch-none select-none items-center gap-2 border-b border-line px-3 py-2 ${
            dragPos ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <GripVertical className="h-3.5 w-3.5 shrink-0 text-faint opacity-0 transition-opacity group-hover/module:opacity-100" />
          <Icon className="h-4 w-4 shrink-0 text-muted" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
            {def.title}
          </span>

          <div ref={menuRef} data-no-drag className="relative opacity-0 transition-opacity group-hover/module:opacity-100">
            <button
              aria-label="Module options"
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
                  <X className="h-3.5 w-3.5" /> Remove module
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
              Coming soon
            </div>
          )}
        </div>
      </div>
    </Rnd>
  );
}
