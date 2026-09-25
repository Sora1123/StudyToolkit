"use client";

import { FileText, GraduationCap, Users } from "lucide-react";
import { Subject } from "@/app/components/ui/subjects";
import { SubjectTag } from "@/app/components/ui/Tags";

/**
 * Upcoming — assignments, exams, and study sessions.
 *
 * No scheduling backend yet, so this uses clearly-structured local sample
 * data. `daysUntil` drives urgency coloring; swap `sampleItems` for a fetch
 * once a calendar/events API exists.
 */

type ItemKind = "assignment" | "exam" | "session";

interface UpcomingItem {
  id: string;
  kind: ItemKind;
  title: string;
  subject: Subject;
  daysUntil: number;
  due: string;
}

const kindMeta: Record<
  ItemKind,
  { icon: typeof FileText; label: string; chip: string }
> = {
  assignment: {
    icon: FileText,
    label: "Assignment",
    chip: "bg-accent-soft text-accent",
  },
  exam: {
    icon: GraduationCap,
    label: "Exam",
    chip: "bg-danger-soft text-danger",
  },
  session: {
    icon: Users,
    label: "Session",
    chip: "bg-success-soft text-success",
  },
};

const sampleItems: UpcomingItem[] = [
  {
    id: "1",
    kind: "assignment",
    title: "Linear Algebra worksheet",
    subject: "Mathematics",
    daysUntil: 1,
    due: "Tomorrow",
  },
  {
    id: "2",
    kind: "exam",
    title: "Physics midterm",
    subject: "Science",
    daysUntil: 3,
    due: "In 3 days",
  },
  {
    id: "3",
    kind: "session",
    title: "CS study group",
    subject: "Computer Science",
    daysUntil: 5,
    due: "Friday",
  },
];

// Urgency accent for the left bar + due text.
function urgency(days: number): { bar: string; text: string } {
  if (days <= 1) return { bar: "var(--danger)", text: "text-danger" };
  if (days <= 3) return { bar: "var(--warning)", text: "text-warning" };
  return { bar: "var(--line-strong)", text: "text-muted" };
}

export default function UpcomingModule() {
  return (
    <ul className="flex h-full flex-col gap-1.5 overflow-y-auto">
      {sampleItems.map((item) => {
        const { icon: Icon, label, chip } = kindMeta[item.kind];
        const u = urgency(item.daysUntil);
        return (
          <li
            key={item.id}
            className="relative flex items-start gap-2.5 overflow-hidden rounded-md border border-line bg-surface py-2 pl-4 pr-3 transition-colors hover:bg-surface-2"
          >
            {/* Urgency bar */}
            <span
              className="absolute inset-y-0 left-0 w-1"
              style={{ backgroundColor: u.bar }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${chip}`}
                >
                  <Icon className="h-3 w-3" /> {label}
                </span>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-text">
                {item.title}
              </p>
              <div className="mt-0.5">
                <SubjectTag subject={item.subject} />
              </div>
            </div>
            <span className={`shrink-0 text-[11px] font-semibold ${u.text}`}>
              {item.due}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
