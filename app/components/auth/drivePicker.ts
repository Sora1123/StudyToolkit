"use client";

/**
 * Thin wrapper around the Google Picker API for selecting Drive files.
 *
 * The Picker needs two things beyond the OAuth access token:
 *  - the `gapi` client with the "picker" module loaded, and
 *  - a browser API key (NEXT_PUBLIC_GOOGLE_API_KEY).
 *
 * Both the picker script (apis.google.com/js/api.js) are loaded lazily the
 * first time a picker is opened, so nothing is fetched for signed-out users.
 */

export const GOOGLE_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY?.trim() || "";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  iconUrl?: string;
}

// --- Minimal typings for gapi + picker (only what we use) ------------------

interface GapiPickerDocument {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  iconUrl?: string;
}
interface PickerResponse {
  action: string;
  docs?: GapiPickerDocument[];
}
type WindowWithGapi = Window & {
  gapi?: {
    load: (name: string, cb: () => void) => void;
  };
  google?: {
    picker?: {
      PickerBuilder: new () => PickerBuilderLike;
      DocsView: new (viewId?: unknown) => DocsViewLike;
      ViewId: { DOCS: unknown; DOCS_IMAGES: unknown; PDFS: unknown };
      Action: { PICKED: string };
      Feature: { MULTISELECT_ENABLED: unknown };
    };
  };
};
interface DocsViewLike {
  setMimeTypes: (m: string) => DocsViewLike;
  setIncludeFolders: (b: boolean) => DocsViewLike;
}
interface PickerBuilderLike {
  addView: (v: unknown) => PickerBuilderLike;
  enableFeature: (f: unknown) => PickerBuilderLike;
  setOAuthToken: (t: string) => PickerBuilderLike;
  setDeveloperKey: (k: string) => PickerBuilderLike;
  setCallback: (cb: (r: PickerResponse) => void) => PickerBuilderLike;
  setTitle: (t: string) => PickerBuilderLike;
  build: () => { setVisible: (v: boolean) => void };
}

const API_SRC = "https://apis.google.com/js/api.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.addEventListener("load", () => resolve(), { once: true });
    s.addEventListener("error", () => reject(new Error("script load failed")), {
      once: true,
    });
    document.head.appendChild(s);
  });
}

let pickerLoaded = false;

/** Ensure gapi + the picker module are ready. */
async function ensurePicker(): Promise<boolean> {
  if (pickerLoaded) return true;
  await loadScript(API_SRC);
  const w = window as WindowWithGapi;
  if (!w.gapi) return false;
  await new Promise<void>((resolve) => w.gapi!.load("picker", () => resolve()));
  pickerLoaded = !!(window as WindowWithGapi).google?.picker;
  return pickerLoaded;
}

export function isPickerConfigured(): boolean {
  return GOOGLE_API_KEY.length > 0;
}

/**
 * Open the Drive Picker filtered to PDFs and images. Resolves with the files
 * the user picked (empty if cancelled), or throws if the picker can't load.
 */
export async function openDrivePicker(
  accessToken: string,
): Promise<DriveFile[]> {
  const ready = await ensurePicker();
  const w = window as WindowWithGapi;
  const picker = w.google?.picker;
  if (!ready || !picker) {
    throw new Error("Google Picker failed to load.");
  }

  return new Promise((resolve) => {
    // Two views: images + PDFs.
    const imagesView = new picker.DocsView(picker.ViewId.DOCS_IMAGES)
      .setIncludeFolders(false);
    const pdfView = new picker.DocsView(picker.ViewId.PDFS).setIncludeFolders(
      false,
    );

    const built = new picker.PickerBuilder()
      .addView(pdfView)
      .addView(imagesView)
      .enableFeature(picker.Feature.MULTISELECT_ENABLED)
      .setOAuthToken(accessToken)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setTitle("Select PDFs or images from Drive")
      .setCallback((r: PickerResponse) => {
        if (r.action === picker.Action.PICKED) {
          const files = (r.docs ?? []).map((d) => ({
            id: d.id,
            name: d.name,
            mimeType: d.mimeType,
            url: d.url,
            iconUrl: d.iconUrl,
          }));
          resolve(files);
        } else if (r.action === "cancel") {
          resolve([]);
        }
      })
      .build();
    built.setVisible(true);
  });
}
