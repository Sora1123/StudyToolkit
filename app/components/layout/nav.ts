import {
  LayoutDashboard,
  ListTodo,
  Layers,
  StickyNote,
  Timer,
  FolderOpen,
  LucideIcon,
} from "lucide-react";

import { TranslationKey } from "@/app/components/i18n/I18nProvider";

export interface NavItem {
  href: string;
  label: string;
  /** i18n key for the label. */
  labelKey: TranslationKey;
  icon: LucideIcon;
  /** Routes that exist today. Others navigate to the dashboard for now. */
  implemented: boolean;
}

/**
 * Primary navigation. Some destinations (Notes, Resources, Settings) are part
 * of the product vision but not yet implemented as standalone routes; they
 * point at the dashboard so the nav stays coherent and is easy to wire up
 * later without inventing backend functionality.
 */
export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, implemented: true },
  { href: "/ToDo", label: "Tasks", labelKey: "nav.tasks", icon: ListTodo, implemented: true },
  {
    href: "/Flashcard",
    label: "Flashcards",
    labelKey: "nav.flashcards",
    icon: Layers,
    implemented: true,
  },
  { href: "/", label: "Notes", labelKey: "nav.notes", icon: StickyNote, implemented: false },
  {
    href: "/PomodoroTimer",
    label: "Timer",
    labelKey: "nav.timer",
    icon: Timer,
    implemented: true,
  },
  { href: "/", label: "Resources", labelKey: "nav.resources", icon: FolderOpen, implemented: false },
];

/** Items surfaced in the compact mobile bottom navigation. */
export const mobileNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, implemented: true },
  { href: "/ToDo", label: "Tasks", labelKey: "nav.tasks", icon: ListTodo, implemented: true },
  {
    href: "/Flashcard",
    label: "Cards",
    labelKey: "nav.cards",
    icon: Layers,
    implemented: true,
  },
  {
    href: "/PomodoroTimer",
    label: "Timer",
    labelKey: "nav.timer",
    icon: Timer,
    implemented: true,
  },
];
