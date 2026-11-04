"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Monitor,
  Sun,
  Moon,
  Download,
  Upload,
  RotateCcw,
} from "lucide-react";
import {
  ACCENTS,
  Accent,
  FONT_FAMILIES,
  FONT_SIZES,
  FontFamily,
  FontSize,
  NotesUnit,
  Theme,
  useSettings,
} from "./SettingsProvider";
import { useWorkspaceContext } from "@/app/components/workspace/WorkspaceProvider";
import { WorkspaceModule } from "@/app/components/workspace/useWorkspace";
import {
  LANGUAGES,
  Language,
  useT,
} from "@/app/components/i18n/I18nProvider";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const THEMES: { value: Theme; label: string; icon: typeof Monitor }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

// Small labelled row.
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-text">{label}</span>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-1 mt-1 text-xs font-semibold uppercase tracking-wide text-faint">
      {children}
    </h3>
  );
}

// Segmented control.
function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-md bg-surface-2 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
            value === o.value
              ? "bg-surface text-accent shadow-sm"
              : "text-muted hover:text-text"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { settings, update, reset } = useSettings();
  const t = useT();
  const workspace = useWorkspaceContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const exportLayout = () => {
    const data = {
      version: 1,
      settings,
      workspace: { modules: workspace.modules },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "studytoolkit-layout.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = async (file: File) => {
    setImportError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as {
        settings?: Partial<typeof settings>;
        workspace?: { modules?: unknown };
      };

      const rawModules = parsed.workspace?.modules;
      if (!Array.isArray(rawModules)) {
        throw new Error("No modules array found.");
      }

      // replaceAll normalizes each entry to the current layout shape
      // ({span, height, order}) and drops anything invalid.
      workspace.replaceAll(rawModules as WorkspaceModule[]);
      if (parsed.settings && typeof parsed.settings === "object") {
        update(parsed.settings);
      }
    } catch (e) {
      console.error("Failed to import layout:", e);
      setImportError("That file couldn't be imported.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[8vh]"
      role="dialog"
      aria-modal="true"
      aria-label={t("settings.title")}
    >
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-semibold text-text">{t("settings.title")}</h2>
          <button
            onClick={onClose}
            aria-label={t("settings.close")}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="no-scrollbar space-y-6 overflow-y-auto p-5">
          {/* Appearance */}
          <section>
            <SectionTitle>{t("settings.section.appearance")}</SectionTitle>
            <div className="divide-y divide-line">
              <Field label={t("settings.theme")}>
                <div className="flex rounded-md bg-surface-2 p-0.5">
                  {THEMES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => update({ theme: value })}
                      aria-label={label}
                      title={label}
                      className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        settings.theme === value
                          ? "bg-surface text-accent shadow-sm"
                          : "text-muted hover:text-text"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {value === "system"
                        ? t("settings.theme.system")
                        : value === "light"
                          ? t("settings.theme.light")
                          : t("settings.theme.dark")}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={t("settings.accent")}>
                <div className="flex items-center gap-1.5">
                  {(Object.keys(ACCENTS) as Accent[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => update({ accent: a })}
                      aria-label={ACCENTS[a].label}
                      title={ACCENTS[a].label}
                      className={`h-6 w-6 rounded-full ring-offset-2 ring-offset-surface transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        settings.accent === a ? "ring-2 ring-accent" : ""
                      }`}
                      style={{ backgroundColor: ACCENTS[a].base }}
                    />
                  ))}
                </div>
              </Field>

              <Field label={t("settings.font")}>
                <Segmented<FontFamily>
                  value={settings.fontFamily}
                  onChange={(v) => update({ fontFamily: v })}
                  options={(Object.keys(FONT_FAMILIES) as FontFamily[]).map(
                    (f) => ({ value: f, label: FONT_FAMILIES[f].label }),
                  )}
                />
              </Field>

              <Field label={t("settings.fontSize")}>
                <Segmented<FontSize>
                  value={settings.fontSize}
                  onChange={(v) => update({ fontSize: v })}
                  options={(Object.keys(FONT_SIZES) as FontSize[]).map((s) => ({
                    value: s,
                    label: FONT_SIZES[s].label,
                  }))}
                />
              </Field>

              <Field label={t("settings.language")}>
                <Segmented<Language>
                  value={settings.language}
                  onChange={(v) => update({ language: v })}
                  options={(Object.keys(LANGUAGES) as Language[]).map((l) => ({
                    value: l,
                    label: LANGUAGES[l].nativeLabel,
                  }))}
                />
              </Field>
            </div>
          </section>

          {/* Workspace */}
          <section>
            <SectionTitle>{t("settings.section.workspace")}</SectionTitle>
            <div className="divide-y divide-line">
              <div className="flex items-center justify-between gap-4 py-2">
                <span className="text-sm text-text">{t("settings.resetWorkspace")}</span>
                {confirmReset ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        workspace.resetWorkspace();
                        setConfirmReset(false);
                      }}
                      className="rounded-md bg-danger px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                    >
                      {t("settings.confirm")}
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="rounded-md px-2 py-1 text-xs text-muted hover:text-text"
                    >
                      {t("settings.cancel")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> {t("settings.reset")}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Data */}
          <section>
            <SectionTitle>{t("settings.section.data")}</SectionTitle>
            <div className="flex flex-wrap items-center gap-2 py-1">
              <button
                onClick={exportLayout}
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-2"
              >
                <Download className="h-4 w-4" /> {t("settings.exportLayout")}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-2"
              >
                <Upload className="h-4 w-4" /> {t("settings.importLayout")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImportFile(f);
                  e.target.value = "";
                }}
              />
            </div>
            {importError && (
              <p className="mt-1 text-xs text-danger">{importError}</p>
            )}
          </section>

          {/* Timer & Notes */}
          <section>
            <SectionTitle>{t("settings.section.timerNotes")}</SectionTitle>
            <div className="divide-y divide-line">
              <Field label={t("settings.focusMin")}>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={settings.pomodoro.focus}
                  onChange={(e) =>
                    update({
                      pomodoro: {
                        ...settings.pomodoro,
                        focus: Math.max(1, Number(e.target.value) || 1),
                      },
                    })
                  }
                  aria-label="Focus minutes"
                  className="w-16 rounded-md border border-line bg-surface px-2 py-1 text-xs text-text outline-none focus:border-accent"
                />
              </Field>
              <Field label={t("settings.breakMin")}>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={settings.pomodoro.break}
                  onChange={(e) =>
                    update({
                      pomodoro: {
                        ...settings.pomodoro,
                        break: Math.max(1, Number(e.target.value) || 1),
                      },
                    })
                  }
                  aria-label="Break minutes"
                  className="w-16 rounded-md border border-line bg-surface px-2 py-1 text-xs text-text outline-none focus:border-accent"
                />
              </Field>
              <Field label={t("settings.longBreakMin")}>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={settings.pomodoro.longBreak}
                  onChange={(e) =>
                    update({
                      pomodoro: {
                        ...settings.pomodoro,
                        longBreak: Math.max(1, Number(e.target.value) || 1),
                      },
                    })
                  }
                  aria-label="Long break minutes"
                  className="w-16 rounded-md border border-line bg-surface px-2 py-1 text-xs text-text outline-none focus:border-accent"
                />
              </Field>
              <Field label={t("settings.rounds")}>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={settings.pomodoro.rounds}
                  onChange={(e) =>
                    update({
                      pomodoro: {
                        ...settings.pomodoro,
                        rounds: Math.max(1, Number(e.target.value) || 1),
                      },
                    })
                  }
                  aria-label={t("settings.rounds")}
                  className="w-16 rounded-md border border-line bg-surface px-2 py-1 text-xs text-text outline-none focus:border-accent"
                />
              </Field>
              <Field label={t("settings.notesCount")}>
                <Segmented<NotesUnit>
                  value={settings.notesUnit}
                  onChange={(v) => update({ notesUnit: v })}
                  options={[
                    { value: "words", label: t("settings.notes.words") },
                    { value: "chars", label: t("settings.notes.chars") },
                  ]}
                />
              </Field>
            </div>
          </section>

          {/* Profile */}
          <section>
            <SectionTitle>{t("settings.section.profile")}</SectionTitle>
            <div className="divide-y divide-line">
              <Field label={t("settings.spaceTitle")}>
                <input
                  type="text"
                  value={settings.spaceTitle}
                  onChange={(e) => update({ spaceTitle: e.target.value })}
                  aria-label={t("settings.spaceTitle")}
                  className="w-40 rounded-md border border-line bg-surface px-2.5 py-1 text-sm text-text outline-none focus:border-accent"
                />
              </Field>
              <Field label={t("settings.displayName")}>
                <input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) => update({ displayName: e.target.value })}
                  aria-label={t("settings.displayName")}
                  className="w-40 rounded-md border border-line bg-surface px-2.5 py-1 text-sm text-text outline-none focus:border-accent"
                />
              </Field>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <button
            onClick={reset}
            className="text-xs font-medium text-faint transition-colors hover:text-muted"
          >
            {t("settings.resetAll")}
          </button>
          <button
            onClick={onClose}
            className="rounded-md bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {t("settings.done")}
          </button>
        </div>
      </div>
    </div>
  );
}
