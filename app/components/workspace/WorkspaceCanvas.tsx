"use client";

import { LayoutGrid, Plus } from "lucide-react";
import Module from "./Module";
import { MODULES } from "./modules.registry";
import { WorkspaceModule } from "./useWorkspace";
import { ModuleLayout } from "./Module";

interface WorkspaceCanvasProps {
  modules: WorkspaceModule[];
  onLayoutChange: (id: string, layout: ModuleLayout) => void;
  onRemove: (id: string) => void;
  onAddFirst: () => void;
}

export default function WorkspaceCanvas({
  modules,
  onLayoutChange,
  onRemove,
  onAddFirst,
}: WorkspaceCanvasProps) {
  if (modules.length === 0) {
    return (
      <div className="desk-canvas flex min-h-[60vh] flex-1 items-center justify-center rounded-xl border border-dashed border-line-strong">
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

  return (
    <div className="desk-canvas relative min-h-[70vh] flex-1 overflow-hidden rounded-xl border border-line">
      {modules.map((m) => (
        <Module
          key={m.id}
          def={MODULES[m.type]}
          layout={m.layout}
          onLayoutChange={(layout) => onLayoutChange(m.id, layout)}
          onRemove={() => onRemove(m.id)}
        />
      ))}
    </div>
  );
}
