import {
  ListTodo,
  Layers,
  StickyNote,
  Timer,
  BarChart3,
  Calculator,
  Calendar,
  FolderOpen,
  Link2,
  CalendarClock,
  LucideIcon,
} from "lucide-react";
import { ComponentType } from "react";

import TasksModule from "@/app/components/modules/TasksModule";
import FlashcardsModule from "@/app/components/modules/FlashcardsModule";
import NotesModule from "@/app/components/modules/NotesModule";
import TimerModule from "@/app/components/modules/TimerModule";
import StatisticsModule from "@/app/components/modules/StatisticsModule";
import CalculatorModule from "@/app/components/modules/CalculatorModule";
import ResourcesModule from "@/app/components/modules/ResourcesModule";
import UpcomingModule from "@/app/components/modules/UpcomingModule";

export type ModuleType =
  | "tasks"
  | "flashcards"
  | "notes"
  | "timer"
  | "statistics"
  | "upcoming"
  | "resources"
  | "calculator"
  | "calendar"
  | "quicklinks";

export type ModuleCategory = "Study" | "Utilities";

export interface ModuleDefinition {
  type: ModuleType;
  title: string;
  description: string;
  icon: LucideIcon;
  category: ModuleCategory;
  /** Whether the module has a working implementation. */
  implemented: boolean;
  /** The content component (only for implemented modules). */
  component?: ComponentType;
  /** Default size on the bulletin-board canvas. */
  defaultSize: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
}

export const MODULES: Record<ModuleType, ModuleDefinition> = {
  tasks: {
    type: "tasks",
    title: "Today's Tasks",
    description: "Track what you need to get done today.",
    icon: ListTodo,
    category: "Study",
    implemented: true,
    component: TasksModule,
    defaultSize: { width: 340, height: 380 },
    minWidth: 260,
    minHeight: 240,
  },
  flashcards: {
    type: "flashcards",
    title: "Flashcards",
    description: "Review cards without leaving your workspace.",
    icon: Layers,
    category: "Study",
    implemented: true,
    component: FlashcardsModule,
    defaultSize: { width: 320, height: 300 },
    minWidth: 260,
    minHeight: 240,
  },
  notes: {
    type: "notes",
    title: "Quick Notes",
    description: "A scratchpad for quick reminders.",
    icon: StickyNote,
    category: "Study",
    implemented: true,
    component: NotesModule,
    defaultSize: { width: 300, height: 260 },
    minWidth: 220,
    minHeight: 180,
  },
  timer: {
    type: "timer",
    title: "Pomodoro Timer",
    description: "Stay focused with timed study sessions.",
    icon: Timer,
    category: "Study",
    implemented: true,
    component: TimerModule,
    defaultSize: { width: 300, height: 380 },
    minWidth: 280,
    minHeight: 360,
  },
  statistics: {
    type: "statistics",
    title: "Study Statistics",
    description: "See your study time, streak, and progress.",
    icon: BarChart3,
    category: "Study",
    implemented: true,
    component: StatisticsModule,
    defaultSize: { width: 320, height: 260 },
    minWidth: 260,
    minHeight: 200,
  },
  upcoming: {
    type: "upcoming",
    title: "Upcoming",
    description: "Assignments, exams, and study sessions.",
    icon: CalendarClock,
    category: "Study",
    implemented: true,
    component: UpcomingModule,
    defaultSize: { width: 360, height: 300 },
    minWidth: 280,
    minHeight: 220,
  },
  calculator: {
    type: "calculator",
    title: "Calculator",
    description: "Graph and compute with Desmos.",
    icon: Calculator,
    category: "Utilities",
    implemented: true,
    component: CalculatorModule,
    defaultSize: { width: 420, height: 380 },
    minWidth: 320,
    minHeight: 280,
  },
  resources: {
    type: "resources",
    title: "Recent Resources",
    description: "Jump back into recently opened materials.",
    icon: FolderOpen,
    category: "Utilities",
    implemented: true,
    component: ResourcesModule,
    defaultSize: { width: 320, height: 280 },
    minWidth: 260,
    minHeight: 200,
  },
  calendar: {
    type: "calendar",
    title: "Calendar",
    description: "A month view of your schedule.",
    icon: Calendar,
    category: "Utilities",
    implemented: false,
    defaultSize: { width: 360, height: 320 },
  },
  quicklinks: {
    type: "quicklinks",
    title: "Quick Links",
    description: "Shortcuts to your most-used tools and sites.",
    icon: Link2,
    category: "Utilities",
    implemented: false,
    defaultSize: { width: 300, height: 240 },
  },
};

export const MODULE_LIST: ModuleDefinition[] = Object.values(MODULES);
