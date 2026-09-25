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
} from "lucide-react";
import { navItems } from "./nav";
import { useSettings } from "@/app/components/settings/SettingsProvider";
import { useT } from "@/app/components/i18n/I18nProvider";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { settings } = useSettings();
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
      {/* Transparent click-catcher so clicking away closes the panel. */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-in panel — opens on left-edge hover, closes on mouse leave. */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar navigation"
        onMouseLeave={onClose}
        className={`no-scrollbar fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-line bg-surface shadow-xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-4">
          <Image
            src="/StudyToolkit.svg"
            alt=""
            aria-hidden="true"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 dark:invert"
            priority
          />
          <span className="text-sm font-semibold tracking-tight text-text">
            {t("app.name")}
          </span>
        </div>

        {/* Search + Notifications */}
        <div className="space-y-2 px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-faint" />
            <input
              type="search"
              placeholder={t("app.search")}
              aria-label={t("app.searchAria")}
              className="w-full rounded-md border border-line bg-surface-2 py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-faint focus:border-accent focus:bg-surface"
            />
          </div>
          <button className="relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2">
            <span className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span>{t("app.notifications")}</span>
          </button>
        </div>

        <nav className="no-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {navItems.map(({ href, label, labelKey, icon: Icon, implemented }, i) => {
            const active = isActive(href, label);
            return (
              <Link
                key={`${label}-${i}`}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  active
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{t(labelKey)}</span>
                {!implemented && (
                  <span className="ml-auto text-[10px] font-medium text-faint">
                    {t("app.soon")}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-muted">
              <CircleUser className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">
                {settings.displayName || t("common.student")}
              </p>
              <p className="truncate text-xs text-faint">{t("app.localWorkspace")}</p>
            </div>
            <button
              aria-label={t("app.help")}
              title={t("app.help")}
              className="ml-auto rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
