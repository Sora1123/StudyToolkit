import {
  LayoutDashboard,
  ListTodo,
  Layers,
  StickyNote,
  Timer,
  FolderOpen,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
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
  { href: "/", label: "Dashboard", icon: LayoutDashboard, implemented: true },
  { href: "/ToDo", label: "Tasks", icon: ListTodo, implemented: true },
  {
    href: "/Flashcard",
    label: "Flashcards",
    icon: Layers,
    implemented: true,
  },
  { href: "/", label: "Notes", icon: StickyNote, implemented: false },
  {
    href: "/PomodoroTimer",
    label: "Timer",
    icon: Timer,
    implemented: true,
  },
  { href: "/", label: "Resources", icon: FolderOpen, implemented: false },
  { href: "/", label: "Settings", icon: Settings, implemented: false },
];

/** Items surfaced in the compact mobile bottom navigation. */
export const mobileNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, implemented: true },
  { href: "/ToDo", label: "Tasks", icon: ListTodo, implemented: true },
  {
    href: "/Flashcard",
    label: "Cards",
    icon: Layers,
    implemented: true,
  },
  {
    href: "/PomodoroTimer",
    label: "Timer",
    icon: Timer,
    implemented: true,
  },
];
