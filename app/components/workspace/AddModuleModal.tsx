"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import {
  MODULE_LIST,
  ModuleCategory,
  ModuleType,
} from "./modules.registry";
import { TranslationKey, useT } from "@/app/components/i18n/I18nProvider";

interface AddModuleModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: ModuleType) => void;
}

const categories: ModuleCategory[] = ["Study", "Utilities"];

const categoryKey: Record<ModuleCategory, TranslationKey> = {
  Study: "add.category.study",
  Utilities: "add.category.utilities",
};

export default function AddModuleModal({
  open,
  onClose,
  onAdd,
}: AddModuleModalProps) {
  const t = useT();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]"
          role="dialog"
          aria-modal="true"
          aria-label={t("add.title")}
        >
          <motion.div
            className="absolute inset-0 bg-black/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div>
                <h2 className="text-sm font-semibold text-text">{t("add.title")}</h2>
                <p className="text-xs text-faint">
                  {t("add.subtitle")}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label={t("add.close")}
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-5 overflow-y-auto p-5">
              {categories.map((category) => (
                <section key={category}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
                    {t(categoryKey[category])}
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {MODULE_LIST.filter((m) => m.category === category).map(
                      (m) => {
                        const Icon = m.icon;
                        return (
                          <motion.button
                            key={m.type}
                            disabled={!m.implemented}
                            whileHover={m.implemented ? { y: -2 } : undefined}
                            whileTap={m.implemented ? { scale: 0.98 } : undefined}
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
                                    {t("app.soon")}
                                  </span>
                                )}
                              </span>
                              <span className="mt-0.5 block text-xs leading-snug text-muted">
                                {m.description}
                              </span>
                            </span>
                          </motion.button>
                        );
                      },
                    )}
                  </div>
                </section>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
