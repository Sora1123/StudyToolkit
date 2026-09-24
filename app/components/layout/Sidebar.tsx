"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, CircleUser, HelpCircle } from "lucide-react";
import { navItems } from "./nav";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, label: string) => {
    // Only the Dashboard entry owns "/". Non-implemented items that fall back
    // to "/" should not appear active.
    if (href === "/") return label === "Dashboard" && pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex items-center gap-2 px-5 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
          <GraduationCap className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight text-text">
          StudyToolkit
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map(({ href, label, icon: Icon, implemented }, i) => {
          const active = isActive(href, label);
          return (
            <Link
              key={`${label}-${i}`}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                active
                  ? "bg-accent-soft font-medium text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              {!implemented && (
                <span className="ml-auto text-[10px] font-medium text-faint">
                  Soon
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
            <p className="truncate text-sm font-medium text-text">Student</p>
            <p className="truncate text-xs text-faint">Local workspace</p>
          </div>
          <button
            aria-label="Help"
            title="Help"
            className="ml-auto rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
