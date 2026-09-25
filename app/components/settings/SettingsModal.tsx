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
  DASHBOARD_PRESETS,
  DashboardSize,
  FONT_FAMILIES,
  FONT_SIZES,
  FontFamily,
  FontSize,
  NotesUnit,
  Theme,
  ZOOM_MAX,
  ZOOM_MIN,
  useSettings,
} from "./SettingsProvider";
import { useWorkspaceContext } from "@/app/components/workspace/WorkspaceProvider";
import { MODULES, ModuleType } from "@/app/components/workspace/modules.registry";
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

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
        checked ? "bg-accent" : "bg-line-strong"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
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

function isModuleType(t: string): t is ModuleType {
  return t in MODULES;
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

  const sizeKind = settings.dashboardSize.kind;
  const sizeValue =
    settings.dashboardSize.kind === "fit"
      ? "fit"
      : settings.dashboardSize.kind === "custom"
        ? "custom"
        : `${settings.dashboardSize.width}x${settings.dashboardSize.height}`;

  const onSizeSelect = (value: string) => {
    if (value === "fit") {
      update({ dashboardSize: { kind: "fit" } });
    } else if (value === "custom") {
      const base =
        settings.dashboardSize.kind !== "fit"
          ? settings.dashboardSize
          : { width: 1600, height: 1000 };
      update({
        dashboardSize: {
          kind: "custom",
          width: base.width,
          height: base.height,
        },
      });
    } else {
      const preset = DASHBOARD_PRESETS.find(
        (p) => `${p.width}x${p.height}` === value,
      );
      if (preset) {
        update({
          dashboardSize: {
            kind: "preset",
            width: preset.width,
            height: preset.height,
          },
        });
      }
    }
  };

  const setCustom = (dim: "width" | "height", raw: number) => {
    if (settings.dashboardSize.kind === "fit") return;
    const next: DashboardSize = {
      kind: "custom",
      width: settings.dashboardSize.width,
      height: settings.dashboardSize.height,
      [dim]: Math.max(320, raw || 0),
    } as DashboardSize;
    update({ dashboardSize: next });
  };

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

      const validModules: WorkspaceModule[] = rawModules
        .filter(
          (m): m is WorkspaceModule =>
            !!m &&
            typeof m === "object" &&
            typeof (m as WorkspaceModule).id === "string" &&
            typeof (m as WorkspaceModule).type === "string" &&
            isModuleType((m as WorkspaceModule).type) &&
            !!(m as WorkspaceModule).layout,
        )
        .map((m) => ({
          id: m.id,
          type: m.type,
          layout: {
            x: Number(m.layout.x) || 0,
            y: Number(m.layout.y) || 0,
            width: Number(m.layout.width) || MODULES[m.type].defaultSize.width,
            height:
              Number(m.layout.height) || MODULES[m.type].defaultSize.height,
          },
        }));

      workspace.replaceAll(validModules);
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

              <Field label={t("settings.deskTexture")}>
                <Toggle
                  label={t("settings.deskTexture")}
                  checked={settings.deskTexture}
                  onChange={(v) => update({ deskTexture: v })}
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
              <Field label={t("settings.dashboardSize")}>
                <select
                  value={sizeValue}
                  onChange={(e) => onSizeSelect(e.target.value)}
                  className="rounded-md border border-line bg-surface px-2 py-1 text-xs text-text outline-none focus:border-accent"
                >
                  <option value="fit">{t("settings.dashboardSize.fit")}</option>
                  {DASHBOARD_PRESETS.map((p) => (
                    <option key={p.label} value={`${p.width}x${p.height}`}>
                      {p.label}
                    </option>
                  ))}
                  <option value="custom">{t("settings.dashboardSize.custom")}</option>
                </select>
              </Field>

              {sizeKind === "custom" &&
                settings.dashboardSize.kind === "custom" && (
                  <div className="flex items-center justify-end gap-2 py-2">
                    <input
                      type="number"
                      min={320}
                      value={settings.dashboardSize.width}
                      onChange={(e) =>
                        setCustom("width", Number(e.target.value))
                      }
                      aria-label="Custom width"
                      className="w-20 rounded-md border border-line bg-surface px-2 py-1 text-xs text-text outline-none focus:border-accent"
                    />
                    <span className="text-xs text-faint">×</span>
                    <input
                      type="number"
                      min={320}
                      value={settings.dashboardSize.height}
                      onChange={(e) =>
                        setCustom("height", Number(e.target.value))
                      }
                      aria-label="Custom height"
                      className="w-20 rounded-md border border-line bg-surface px-2 py-1 text-xs text-text outline-none focus:border-accent"
                    />
                  </div>
                )}

              <Field label={t("settings.snapping")}>
                <Toggle
                  label={t("settings.snapping")}
                  checked={settings.snapping}
                  onChange={(v) => update({ snapping: v })}
                />
              </Field>

              <Field label={t("settings.defaultZoom")}>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={Math.round(ZOOM_MIN * 100)}
                    max={Math.round(ZOOM_MAX * 100)}
                    step={10}
                    value={Math.round(settings.defaultZoom * 100)}
                    onChange={(e) => {
                      const pct = Number(e.target.value);
                      if (!Number.isFinite(pct)) return;
                      const frac = Math.min(
                        ZOOM_MAX,
                        Math.max(ZOOM_MIN, pct / 100),
                      );
                      update({ defaultZoom: frac });
                    }}
                    aria-label={t("settings.defaultZoom")}
                    className="w-16 rounded-md border border-line bg-surface px-2 py-1 text-xs text-text outline-none focus:border-accent"
                  />
                  <span className="text-xs text-faint">%</span>
                </div>
              </Field>

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
