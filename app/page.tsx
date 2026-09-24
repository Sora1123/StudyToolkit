"use client";

import { useMemo, useState } from "react";
import { Search, Bell, Plus, RotateCcw, X } from "lucide-react";
import { useWorkspace } from "./components/workspace/useWorkspace";
import WorkspaceCanvas from "./components/workspace/WorkspaceCanvas";
import AddModuleModal from "./components/workspace/AddModuleModal";
import { MODULES } from "./components/workspace/modules.registry";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const {
    modules,
    hydrated,
    addModule,
    removeModule,
    updateLayout,
    resetWorkspace,
  } = useWorkspace();
  const [addOpen, setAddOpen] = useState(false);

  // Greeting is computed once per mount (client only) to avoid SSR mismatch.
  const subtitle = useMemo(
    () => `${greeting()}. What are you working on?`,
    [],
  );

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-line bg-bg/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-auto min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-text sm:text-xl">
              My Study Space
            </h1>
            <p className="truncate text-xs text-muted sm:text-sm">
              {subtitle}
            </p>
          </div>

          {/* Search (visual + accessible; wired to filter later) */}
          <div className="relative hidden items-center sm:flex">
            <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-faint" />
            <input
              type="search"
              placeholder="Search"
              aria-label="Search your study space"
              className="w-44 rounded-md border border-line bg-surface py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-faint focus:border-accent lg:w-56"
            />
          </div>

          <button
            aria-label="Notifications"
            title="Notifications"
            className="relative rounded-md border border-line bg-surface p-2 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </button>

          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add module</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        {!hydrated ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-faint">Loading your workspace…</p>
          </div>
        ) : (
          <>
            {/* Desktop / tablet: draggable bulletin-board canvas */}
            <div className="hidden flex-1 md:flex md:flex-col">
              {modules.length > 0 && (
                <div className="mb-2 flex justify-end">
                  <button
                    onClick={resetWorkspace}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-faint transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset layout
                  </button>
                </div>
              )}
              <WorkspaceCanvas
                modules={modules}
                onLayoutChange={updateLayout}
                onRemove={removeModule}
                onAddFirst={() => setAddOpen(true)}
              />
            </div>

            {/* Mobile: single-column, full-width stacked modules */}
            <div className="flex flex-col gap-4 md:hidden">
              {modules.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line-strong p-8 text-center">
                  <h2 className="text-base font-semibold text-text">
                    Build your study space
                  </h2>
                  <p className="mt-1.5 text-sm text-muted">
                    Add the tools you use most and arrange them your way.
                  </p>
                  <button
                    onClick={() => setAddOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
                  >
                    <Plus className="h-4 w-4" /> Add your first module
                  </button>
                </div>
              ) : (
                modules.map((m) => {
                  const def = MODULES[m.type];
                  const Content = def.component;
                  const Icon = def.icon;
                  return (
                    <section
                      key={m.id}
                      className="overflow-hidden rounded-lg border border-line bg-surface"
                      style={{ height: def.defaultSize.height }}
                    >
                      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
                        <Icon className="h-4 w-4 text-muted" />
                        <span className="flex-1 truncate text-sm font-medium text-text">
                          {def.title}
                        </span>
                        <button
                          aria-label={`Remove ${def.title}`}
                          onClick={() => removeModule(m.id)}
                          className="rounded p-1 text-muted transition-colors hover:bg-surface-2 hover:text-danger"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="h-[calc(100%-41px)] overflow-auto p-3">
                        {Content ? (
                          <Content />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-faint">
                            Coming soon
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      <AddModuleModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addModule}
      />
    </div>
  );
}
