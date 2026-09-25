"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { useWorkspaceContext } from "./components/workspace/WorkspaceProvider";
import { useSettings } from "./components/settings/SettingsProvider";
import WorkspaceCanvas from "./components/workspace/WorkspaceCanvas";
import AddModuleModal from "./components/workspace/AddModuleModal";
import { MODULES } from "./components/workspace/modules.registry";
import { useT } from "./components/i18n/I18nProvider";

export default function Home() {
  const { modules, hydrated, addModule, removeModule, updateLayout } =
    useWorkspaceContext();
  const { settings } = useSettings();
  const t = useT();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="relative flex h-full min-h-full flex-col">
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        {!hydrated ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-faint">Loading your workspace…</p>
          </div>
        ) : (
          <>
            {/* Desktop / tablet: draggable bulletin-board canvas */}
            <div className="hidden flex-1 md:flex md:flex-col">
              <WorkspaceCanvas
                modules={modules}
                snapping={settings.snapping}
                defaultZoom={settings.defaultZoom}
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
                    {t("workspace.buildTitle")}
                  </h2>
                  <p className="mt-1.5 text-sm text-muted">
                    {t("workspace.buildSubtitleMobile")}
                  </p>
                  <button
                    onClick={() => setAddOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
                  >
                    <Plus className="h-4 w-4" /> {t("workspace.addFirst")}
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
                            {t("common.comingSoon")}
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

      {/* Floating "Add module" button — bottom-right circular FAB */}
      <motion.button
        onClick={() => setAddOpen(true)}
        aria-label={t("workspace.addModule")}
        title={t("workspace.addModule")}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-20 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 md:bottom-8 md:right-8"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <AddModuleModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addModule}
      />
    </div>
  );
}
