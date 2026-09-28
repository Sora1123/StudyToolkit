"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Globe, Plus, Trash2, X } from "lucide-react";

/**
 * Quick Links — user-curated shortcuts to frequently used tools and sites,
 * persisted to localStorage under `studytoolkit.quicklinks`.
 *
 * Favicons are pulled from Google's favicon service by hostname; if that fails
 * to load we fall back to a generic globe icon.
 */

const STORAGE_KEY = "studytoolkit.quicklinks";

interface QuickLink {
  id: string;
  label: string;
  url: string;
}

/** Normalize user input into a valid absolute URL, or null if unusable. */
function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function faviconFor(url: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    hostnameOf(url),
  )}&sz=64`;
}

function loadLinks(): QuickLink[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is QuickLink =>
        !!l &&
        typeof l.id === "string" &&
        typeof l.label === "string" &&
        typeof l.url === "string",
    );
  } catch {
    return [];
  }
}

/** Small favicon with a graceful fallback to a globe icon on load error. */
function Favicon({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <Globe className="h-4 w-4 text-muted" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={faviconFor(url)}
      alt=""
      aria-hidden="true"
      width={16}
      height={16}
      className="h-4 w-4 rounded-sm"
      onError={() => setFailed(true)}
    />
  );
}

export default function QuickLinksModule() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setLinks(loadLinks());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch {
      /* ignore */
    }
  }, [links, hydrated]);

  const canAdd = useMemo(() => normalizeUrl(url) !== null, [url]);

  const addLink = () => {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError("Enter a valid URL.");
      return;
    }
    setLinks((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label: label.trim() || hostnameOf(normalized),
        url: normalized,
      },
    ]);
    setLabel("");
    setUrl("");
    setError(null);
    setAdding(false);
  };

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="flex h-full flex-col">
      {links.length === 0 && !adding ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <Globe className="h-6 w-6 text-faint" />
          <p className="text-sm text-muted">No links yet.</p>
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-3.5 w-3.5" /> Add a link
          </button>
        </div>
      ) : (
        <ul className="flex-1 space-y-0.5 overflow-y-auto">
          {links.map((l) => (
            <li key={l.id}>
              <div className="group/link flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-2">
                  <Favicon url={l.url} />
                </span>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1"
                  title={l.url}
                >
                  <span className="block truncate text-sm text-text">
                    {l.label}
                  </span>
                  <span className="block truncate text-[11px] text-faint">
                    {hostnameOf(l.url)}
                  </span>
                </a>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${l.label}`}
                  className="shrink-0 text-faint opacity-0 transition-opacity hover:text-text group-hover/link:opacity-100"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => removeLink(l.id)}
                  aria-label={`Delete ${l.label}`}
                  className="shrink-0 text-faint opacity-0 transition-opacity hover:text-danger group-hover/link:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add form */}
      {adding ? (
        <div className="mt-2 shrink-0 space-y-1.5 rounded-md border border-line bg-surface-2/50 p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text">New link</span>
            <button
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
              aria-label="Cancel"
              className="rounded p-0.5 text-faint transition-colors hover:text-text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canAdd) addLink();
            }}
            placeholder="URL (e.g. drive.google.com)"
            aria-label="Link URL"
            className="w-full rounded-md border border-line bg-surface px-2 py-1 text-xs text-text outline-none focus:border-accent"
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canAdd) addLink();
            }}
            placeholder="Label (optional)"
            aria-label="Link label"
            className="w-full rounded-md border border-line bg-surface px-2 py-1 text-xs text-text outline-none focus:border-accent"
          />
          {error && <p className="text-[11px] text-danger">{error}</p>}
          <button
            onClick={addLink}
            disabled={!canAdd}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      ) : (
        links.length > 0 && (
          <button
            onClick={() => setAdding(true)}
            className="mt-1.5 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <Plus className="h-3.5 w-3.5" /> Add link
          </button>
        )
      )}
    </div>
  );
}
