"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

/**
 * Google Sign-In auth, using Google Identity Services (GIS) entirely on the
 * client — no server secret or backend session is required for identity.
 *
 * Sign-in yields an ID token (a JWT) that we decode locally to obtain the
 * user's basic profile (name, email, picture). The decoded profile is cached
 * in localStorage so the session survives reloads until the user signs out.
 *
 * A separate OAuth **access token** (for calling the Drive API / Picker) is
 * requested on demand via the GIS token client; that lives only in memory.
 *
 * Everything is gated on NEXT_PUBLIC_GOOGLE_CLIENT_ID. When it is absent the
 * provider reports `configured: false` and the UI shows a setup hint instead
 * of attempting any Google calls.
 */

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";

// Scope needed to let the user pick and read their own Drive files.
export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

const PROFILE_KEY = "studytoolkit.auth.profile";

export interface UserProfile {
  sub: string; // Google account id
  name: string;
  email: string;
  picture: string;
}

interface AuthContextValue {
  /** True when a client ID is configured; otherwise auth is unavailable. */
  configured: boolean;
  user: UserProfile | null;
  /** Prompt the Google sign-in flow. */
  signIn: () => void;
  signOut: () => void;
  /**
   * Acquire an OAuth access token for the Drive scope (prompts consent the
   * first time). Resolves null if unavailable/denied. Used by the Drive Picker.
   */
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// --- Minimal GIS typings (only what we use) --------------------------------

interface CredentialResponse {
  credential: string;
}
interface TokenResponse {
  access_token?: string;
  error?: string;
}
interface GoogleAccounts {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (r: CredentialResponse) => void;
      auto_select?: boolean;
    }) => void;
    prompt: () => void;
    disableAutoSelect: () => void;
  };
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (r: TokenResponse) => void;
    }) => { requestAccessToken: (o?: { prompt?: string }) => void };
  };
}
type WindowWithGoogle = Window & {
  google?: { accounts: GoogleAccounts };
};

const GIS_SRC = "https://accounts.google.com/gsi/client";

/** Decode the payload of a JWT (no verification — display only). */
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

function loadProfile(): UserProfile | null {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && typeof p.sub === "string" && typeof p.email === "string") {
      return p as UserProfile;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Load the GIS script once; resolves when window.google is available. */
function loadGis(): Promise<GoogleAccounts | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const w = window as WindowWithGoogle;
  if (w.google?.accounts) return Promise.resolve(w.google.accounts);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SRC}"]`,
    );
    const onReady = () => {
      const gw = window as WindowWithGoogle;
      resolve(gw.google?.accounts ?? null);
    };
    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      // May already be loaded.
      if ((window as WindowWithGoogle).google?.accounts) onReady();
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", () => resolve(null), { once: true });
    document.head.appendChild(script);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = GOOGLE_CLIENT_ID.length > 0;
  const [user, setUser] = useState<UserProfile | null>(null);
  const accountsRef = useRef<GoogleAccounts | null>(null);
  const tokenClientRef = useRef<ReturnType<
    GoogleAccounts["oauth2"]["initTokenClient"]
  > | null>(null);

  // Restore cached profile + initialize GIS (when configured).
  useEffect(() => {
    if (!configured) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(loadProfile());

    let cancelled = false;
    loadGis().then((accounts) => {
      if (cancelled || !accounts) return;
      accountsRef.current = accounts;
      accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (resp) => {
          const claims = decodeJwt(resp.credential);
          if (!claims) return;
          const profile: UserProfile = {
            sub: String(claims.sub ?? ""),
            name: String(claims.name ?? ""),
            email: String(claims.email ?? ""),
            picture: String(claims.picture ?? ""),
          };
          setUser(profile);
          try {
            window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
          } catch {
            /* ignore */
          }
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [configured]);

  const signIn = useCallback(() => {
    if (!configured) return;
    const accounts = accountsRef.current;
    if (!accounts) return;
    accounts.id.prompt();
  }, [configured]);

  const signOut = useCallback(() => {
    accountsRef.current?.id.disableAutoSelect();
    setUser(null);
    try {
      window.localStorage.removeItem(PROFILE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const getAccessToken = useCallback((): Promise<string | null> => {
    if (!configured) return Promise.resolve(null);
    const accounts = accountsRef.current;
    if (!accounts) return Promise.resolve(null);
    return new Promise((resolve) => {
      if (!tokenClientRef.current) {
        tokenClientRef.current = accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: DRIVE_SCOPE,
          callback: (resp) => {
            resolve(resp.access_token ?? null);
          },
        });
      } else {
        // Re-point the callback for this request.
        // initTokenClient returns a client bound to its callback; simplest is
        // to create a fresh client each call to capture this resolve.
        tokenClientRef.current = accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: DRIVE_SCOPE,
          callback: (resp) => resolve(resp.access_token ?? null),
        });
      }
      tokenClientRef.current.requestAccessToken();
    });
  }, [configured]);

  return (
    <AuthContext.Provider
      value={{ configured, user, signIn, signOut, getAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
