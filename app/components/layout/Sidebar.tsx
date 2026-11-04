"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  CircleUser,
  HelpCircle,
  Search,
  Bell,
  Settings,
  LogIn,
  LogOut,
} from "lucide-react";
import { navItems } from "./nav";
import { useSettings } from "@/app/components/settings/SettingsProvider";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { useT } from "@/app/components/i18n/I18nProvider";

interface SidebarProps {
  /** Expanded (full labelled panel) vs. collapsed (icon rail on desktop). */
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Opens the settings modal (settings lives in the sidebar, not a header). */
  onOpenSettings: () => void;
}

/** Widths for the collapsed icon rail and the expanded labelled panel. */
export const RAIL_WIDTH = 56; // px
export const PANEL_WIDTH = 224; // px (w-56)

export default function Sidebar({ open, onOpen, onClose, onOpenSettings }: SidebarProps) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { configured, user, signIn, signOut } = useAuth();
  const t = useT();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const isActive = (href: string, label: string) => {
    if (href === "/") return label === "Dashboard" && pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile-only click-catcher: on small screens the expanded panel floats
          over the content, so clicking away should close it. */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        role="navigation"
        aria-label="Sidebar navigation"
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
        style={{ width: open ? PANEL_WIDTH : RAIL_WIDTH }}
        className={`no-scrollbar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-surface transition-[width,transform] duration-200 ease-out ${
          open ? "shadow-xl" : "shadow-sm"
        } ${
          // Mobile: collapse fully off-screen unless expanded (bottom nav is the
          // primary mobile nav). Desktop: always visible as a rail or panel.
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand — icon always visible; wordmark fades in when expanded.
            Fixed row height + centered fixed-size icon box so the logo never
            gets squeezed or resized between collapsed/expanded states. */}
        <div
          className={`flex h-14 shrink-0 items-center ${
            open ? "gap-2 px-4" : "justify-center px-0"
          }`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center">
            <Image
              src="/StudyToolkit.svg"
              alt=""
              aria-hidden="true"
              width={28}
              height={28}
              className="h-7 w-7 dark:invert"
              priority
            />
          </span>
          <span
            className={`truncate text-sm font-semibold tracking-tight text-text transition-opacity duration-150 ${
              open ? "opacity-100" : "hidden opacity-0"
            }`}
          >
            {t("app.name")}
          </span>
        </div>

        {/* Search + Notifications */}
        <div className="space-y-1 px-2 pb-2 border-b border-line">
          {open ? (
            <div className="relative flex h-9 items-center px-1">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-faint" />
              <input
                type="search"
                placeholder={t("app.search")}
                aria-label={t("app.searchAria")}
                className="h-full w-full rounded-md border border-line bg-surface-2 pl-9 pr-3 text-sm outline-none placeholder:text-faint focus:border-accent focus:bg-surface"
              />
            </div>
          ) : (
            <button
              aria-label={t("app.search")}
              title={t("app.search")}
              onClick={onOpen}
              className="flex h-9 w-full items-center rounded-md px-3 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                <Search className="h-4 w-4" />
              </span>
            </button>
          )}

          <button
            aria-label={t("app.notifications")}
            title={open ? undefined : t("app.notifications")}
            className="flex h-9 w-full items-center gap-2.5 rounded-md px-3 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span
              className={`truncate transition-opacity duration-150 ${
                open ? "opacity-100" : "hidden opacity-0"
              }`}
            >
              {t("app.notifications")}
            </span>
          </button>
        </div>

        <nav className="no-scrollbar flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
          {navItems.map(({ href, label, labelKey, icon: Icon, implemented }, i) => {
            const active = isActive(href, label);
            return (
              <Link
                key={`${label}-${i}`}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                title={open ? undefined : t(labelKey)}
                className={`flex h-9 items-center gap-2.5 rounded-md px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  active
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={`truncate transition-opacity duration-150 ${
                    open ? "opacity-100" : "hidden opacity-0"
                  }`}
                >
                  {t(labelKey)}
                </span>
                {open && !implemented && (
                  <span className="ml-auto text-[10px] font-medium text-faint">
                    {t("app.soon")}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-2">
          {/* Settings — sits directly above the profile block. */}
          <button
            onClick={onOpenSettings}
            aria-label={t("app.settings")}
            title={open ? undefined : t("app.settings")}
            className="flex h-9 w-full items-center gap-2.5 rounded-md px-3 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
              <Settings className="h-4 w-4" />
            </span>
            <span
              className={`truncate transition-opacity duration-150 ${
                open ? "opacity-100" : "hidden opacity-0"
              }`}
            >
              {t("app.settings")}
            </span>
          </button>

          {/* Account — Google sign-in / profile, or local display name.
              Uses the same h-9 row + fixed icon slot as everything else so the
              icon never moves between signed-in/out or collapsed/expanded. */}
          {configured && !user ? (
            <button
              onClick={signIn}
              aria-label={t("app.signIn")}
              title={open ? undefined : t("app.signIn")}
              className="mt-0.5 flex h-9 w-full items-center gap-2.5 rounded-md px-3 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                <LogIn className="h-4 w-4" />
              </span>
              <span
                className={`truncate transition-opacity duration-150 ${
                  open ? "opacity-100" : "hidden opacity-0"
                }`}
              >
                {t("app.signIn")}
              </span>
            </button>
          ) : (
            <div className="mt-0.5 flex h-11 items-center gap-2.5 rounded-md pl-1.5 pr-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full">
                {user?.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.picture}
                    alt=""
                    aria-hidden="true"
                    width={28}
                    height={28}
                    className="h-7 w-7 max-w-none rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <CircleUser className="h-5 w-5 max-w-none" />
                )}
              </span>
              <div
                className={`min-w-0 leading-tight transition-opacity duration-150 ${
                  open ? "opacity-100" : "hidden opacity-0"
                }`}
              >
                <p className="truncate text-sm font-medium text-text">
                  {user?.name || settings.displayName || t("common.student")}
                </p>
                <p className="truncate text-xs text-faint">
                  {user?.email || t("app.localWorkspace")}
                </p>
              </div>
              {open &&
                (user ? (
                  <button
                    onClick={signOut}
                    aria-label={t("app.signOut")}
                    title={t("app.signOut")}
                    className="ml-auto rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    aria-label={t("app.help")}
                    title={t("app.help")}
                    className="ml-auto rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
