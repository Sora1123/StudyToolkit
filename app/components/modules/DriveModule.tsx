"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  FileImage,
  File as FileIcon,
  ExternalLink,
  Trash2,
  HardDrive,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/app/components/auth/AuthProvider";
import {
  DriveFile,
  isPickerConfigured,
  openDrivePicker,
} from "@/app/components/auth/drivePicker";
import { useT } from "@/app/components/i18n/I18nProvider";

/**
 * Google Drive — browse and open your Drive PDFs & images via the Google
 * Picker. Picked files are remembered locally (studytoolkit.drive.recent) so
 * you can jump back into them; the list stores only file metadata + links,
 * never file contents.
 *
 * Gracefully degrades: shows setup hints when Google isn't configured or the
 * user isn't signed in.
 */

const STORAGE_KEY = "studytoolkit.drive.recent";
const MAX_RECENT = 20;

function iconFor(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType === "application/pdf") return FileText;
  return FileIcon;
}

function loadRecent(): DriveFile[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (f): f is DriveFile =>
        !!f &&
        typeof f.id === "string" &&
        typeof f.name === "string" &&
        typeof f.url === "string",
    );
  } catch {
    return [];
  }
}

export default function DriveModule() {
  const { configured, user, signIn, getAccessToken } = useAuth();
  const t = useT();
  const [recent, setRecent] = useState<DriveFile[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setRecent(loadRecent());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    } catch {
      /* ignore */
    }
  }, [recent, hydrated]);

  const browse = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Drive access was not granted.");
        return;
      }
      const picked = await openDrivePicker(token);
      if (picked.length > 0) {
        setRecent((prev) => {
          const byId = new Map(prev.map((f) => [f.id, f]));
          for (const f of picked) byId.set(f.id, f);
          return Array.from(byId.values()).slice(-MAX_RECENT).reverse();
        });
      }
    } catch (e) {
      console.error("Drive picker error:", e);
      setError("Couldn't open the Drive picker.");
    } finally {
      setBusy(false);
    }
  }, [getAccessToken]);

  const remove = (id: string) =>
    setRecent((prev) => prev.filter((f) => f.id !== id));

  // --- Non-functional states (clear guidance instead of dead buttons) ------

  if (!configured) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <HardDrive className="h-6 w-6 text-faint" />
        <p className="text-sm text-muted">Google Drive isn&apos;t set up.</p>
        <p className="max-w-[16rem] text-xs text-faint">
          Add a Google OAuth client ID and API key to enable Drive access.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <HardDrive className="h-6 w-6 text-faint" />
        <p className="text-sm text-muted">{t("app.signInHint")}</p>
        <button
          onClick={signIn}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <LogIn className="h-3.5 w-3.5" /> {t("app.signIn")}
        </button>
      </div>
    );
  }

  const pickerReady = isPickerConfigured();

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center gap-2">
        <button
          onClick={browse}
          disabled={busy || !pickerReady}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          <HardDrive className="h-3.5 w-3.5" />
          {busy ? "Opening…" : "Browse Drive"}
        </button>
        {!pickerReady && (
          <span className="text-[11px] text-warning">
            Set NEXT_PUBLIC_GOOGLE_API_KEY to enable browsing.
          </span>
        )}
      </div>

      {error && <p className="mb-1 text-[11px] text-danger">{error}</p>}

      {recent.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
          <FileIcon className="h-6 w-6 text-faint" />
          <p className="text-sm text-muted">No files yet.</p>
          <p className="text-xs text-faint">
            Browse your Drive to add PDFs and images here.
          </p>
        </div>
      ) : (
        <ul className="flex-1 space-y-0.5 overflow-y-auto">
          {recent.map((f) => {
            const Icon = iconFor(f.mimeType);
            return (
              <li key={f.id}>
                <div className="group/f flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted">
                    <Icon className="h-4 w-4" />
                  </span>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1"
                    title={f.name}
                  >
                    <span className="block truncate text-sm text-text">
                      {f.name}
                    </span>
                    <span className="block truncate text-[11px] text-faint">
                      {f.mimeType.startsWith("image/")
                        ? "Image"
                        : f.mimeType === "application/pdf"
                          ? "PDF"
                          : "File"}
                    </span>
                  </a>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${f.name}`}
                    className="shrink-0 text-faint opacity-0 transition-opacity hover:text-text group-hover/f:opacity-100"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => remove(f.id)}
                    aria-label={`Remove ${f.name}`}
                    className="shrink-0 text-faint opacity-0 transition-opacity hover:text-danger group-hover/f:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
