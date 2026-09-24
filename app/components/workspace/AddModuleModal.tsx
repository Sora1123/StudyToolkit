"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import {
  MODULE_LIST,
  ModuleCategory,
  ModuleType,
} from "./modules.registry";

interface AddModuleModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: ModuleType) => void;
}

const categories: ModuleCategory[] = ["Study", "Utilities"];

export default function AddModuleModal({
  open,
  onClose,
  onAdd,
}: AddModuleModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Add a module"
    >
      <div
        className="absolute inset-0 bg-black/25"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-text">Add a module</h2>
            <p className="text-xs text-faint">
              Pick a tool to add to your study space.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto p-5">
          {categories.map((category) => (
            <section key={category}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
                {category}
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {MODULE_LIST.filter((m) => m.category === category).map(
                  (m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.type}
                        disabled={!m.implemented}
                        onClick={() => {
                          if (!m.implemented) return;
                          onAdd(m.type);
                          onClose();
                        }}
                        className={`flex items-start gap-3 rounded-lg border border-line p-3 text-left transition-colors ${
                          m.implemented
                            ? "hover:border-accent/40 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2"
                            : "cursor-not-allowed opacity-60"
                        }`}
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-text">
                              {m.title}
                            </span>
                            {!m.implemented && (
                              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-faint">
                                Soon
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted">
                            {m.description}
                          </span>
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
