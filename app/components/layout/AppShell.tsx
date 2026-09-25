"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Settings } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import SettingsModal from "@/app/components/settings/SettingsModal";

// Map routes to header titles.
function useTitle(): string {
  const pathname = usePathname();
  if (pathname.startsWith("/ToDo")) return "Tasks";
  if (pathname.startsWith("/Flashcard")) return "Flashcards";
  if (pathname.startsWith("/PomodoroTimer")) return "Timer";
  if (pathname.startsWith("/Calculator")) return "Calculator";
  return "My Study Space";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Sidebar is closed by default and opens when the menu button is clicked.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const title = useTitle();

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar overlay (closed by default, slides in on open). */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Notion-style 40px header. */}
        <header className="flex h-10 shrink-0 items-center gap-2 border-b border-line bg-bg px-2">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
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
            aria-label="Settings"
            title="Settings"
            className="ml-auto rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Settings className="h-4 w-4" />
          </button>
        </header>

        {/* Content fills the remaining window height. */}
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</div>
      </div>

      <MobileNav />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
