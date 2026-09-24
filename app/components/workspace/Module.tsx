"use client";

import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { GripVertical, MoreVertical, X } from "lucide-react";
import { ModuleDefinition } from "./modules.registry";

export interface ModuleLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ModuleProps {
  def: ModuleDefinition;
  layout: ModuleLayout;
  onLayoutChange: (layout: ModuleLayout) => void;
  onRemove: () => void;
}

export default function Module({
  def,
  layout,
  onLayoutChange,
  onRemove,
}: ModuleProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const Content = def.component;
  const Icon = def.icon;

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
      position={{ x: layout.x, y: layout.y }}
      onDragStop={(_e, d) =>
        onLayoutChange({ ...layout, x: d.x, y: d.y })
      }
      onResizeStop={(_e, _dir, ref, _delta, position) =>
        onLayoutChange({
          x: position.x,
          y: position.y,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        })
      }
      minWidth={def.minWidth ?? 220}
      minHeight={def.minHeight ?? 180}
      bounds="parent"
      dragHandleClassName="module-drag-handle"
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
      <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow group-hover/module:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        {/* Header — drag handle + hover-revealed controls */}
        <div className="module-drag-handle flex cursor-grab items-center gap-2 border-b border-line px-3 py-2 active:cursor-grabbing">
          <GripVertical className="h-3.5 w-3.5 shrink-0 text-faint opacity-0 transition-opacity group-hover/module:opacity-100" />
          <Icon className="h-4 w-4 shrink-0 text-muted" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
            {def.title}
          </span>

          <div
            ref={menuRef}
            className="relative opacity-0 transition-opacity group-hover/module:opacity-100"
          >
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
