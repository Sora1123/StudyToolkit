"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useWorkspaceContext } from "./components/workspace/WorkspaceProvider";
import WorkspaceCanvas from "./components/workspace/WorkspaceCanvas";
import AddModuleModal from "./components/workspace/AddModuleModal";
import { useT } from "./components/i18n/I18nProvider";

export default function Home() {
  const { modules, hydrated, addModule, removeModule, updateLayout, reorder } =
    useWorkspaceContext();
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
          <WorkspaceCanvas
            modules={modules}
            onLayoutChange={updateLayout}
            onRemove={removeModule}
            onReorder={reorder}
            onAddFirst={() => setAddOpen(true)}
          />
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
