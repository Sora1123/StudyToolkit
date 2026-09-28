"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar, { RAIL_WIDTH } from "./Sidebar";
import MobileNav from "./MobileNav";
import SettingsModal from "@/app/components/settings/SettingsModal";
import { useT } from "@/app/components/i18n/I18nProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = useT();

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar
        open={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* On desktop the collapsed icon rail is always visible, so pad the
          content column by the rail width; the rail expands over the content
          on hover without shifting it further. On mobile the sidebar floats as
          an overlay, so no space is reserved. */}
      <div
        className="flex flex-1 flex-col overflow-hidden md:pl-[var(--rail)]"
        style={{ ["--rail" as string]: `${RAIL_WIDTH}px` }}
      >
        <div className="no-scrollbar flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </div>
      </div>

      {/* Mobile-only opener: with no header, this floating button reveals the
          sidebar (and its Settings entry) on small screens. Hidden on desktop
          where the rail is always visible. */}
      <button
        onClick={() => setSidebarOpen(true)}
        aria-label={t("app.openSidebar")}
        aria-expanded={sidebarOpen}
        className="glass fixed bottom-[4.5rem] left-3 z-40 rounded-full border border-line bg-surface p-2.5 text-muted shadow-lg transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <MobileNav />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
