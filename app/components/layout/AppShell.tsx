"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Settings } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import SettingsModal from "@/app/components/settings/SettingsModal";
import { useSettings } from "@/app/components/settings/SettingsProvider";
import { TranslateFn, useT } from "@/app/components/i18n/I18nProvider";

// Map routes to header titles.
function useTitle(spaceTitle: string, t: TranslateFn): string {
  const pathname = usePathname();
  if (pathname.startsWith("/ToDo")) return t("nav.tasks");
  if (pathname.startsWith("/Flashcard")) return t("nav.flashcards");
  if (pathname.startsWith("/PomodoroTimer")) return t("nav.timer");
  if (pathname.startsWith("/Calculator")) return t("nav.calculator");
  return spaceTitle || t("title.defaultSpace");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings } = useSettings();
  const t = useT();
  const title = useTitle(settings.spaceTitle, t);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Left-edge hover zone opens the sidebar (desktop). */}
      <div
        onMouseEnter={() => setSidebarOpen(true)}
        className="fixed inset-y-0 left-0 z-30 hidden w-2.5 md:block"
        aria-hidden="true"
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Notion-style 40px header. */}
        <header className="flex h-10 shrink-0 items-center gap-2 border-b border-line bg-bg px-2">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label={t("app.openSidebar")}
            aria-expanded={sidebarOpen}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Menu className="h-4 w-4" />
          </button>

          <span className="min-w-0 truncate text-sm font-medium text-text">
            {title}
          </span>

          <button
            onClick={() => setSettingsOpen(true)}
            aria-label={t("app.settings")}
            title={t("app.settings")}
            className="ml-auto rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Settings className="h-4 w-4" />
          </button>
        </header>

        <div className="no-scrollbar flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </div>
      </div>

      <MobileNav />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
