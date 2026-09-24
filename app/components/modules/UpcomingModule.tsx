"use client";

import { FileText, GraduationCap, Users } from "lucide-react";
import { Subject } from "@/app/components/ui/subjects";
import { SubjectTag } from "@/app/components/ui/Tags";

/**
 * Upcoming — assignments, exams, and study sessions.
 *
 * There is no backend for scheduled items yet, so this uses clearly-structured
 * local sample data. The `UpcomingItem` shape is the extension point: swap
 * `sampleItems` for a fetch once a calendar/events API exists.
 */

type ItemKind = "assignment" | "exam" | "session";

interface UpcomingItem {
  id: string;
  kind: ItemKind;
  title: string;
  subject: Subject;
  due: string; // human-readable for now
}

const kindMeta: Record<
  ItemKind,
  { icon: typeof FileText; label: string }
> = {
  assignment: { icon: FileText, label: "Assignment" },
  exam: { icon: GraduationCap, label: "Exam" },
  session: { icon: Users, label: "Study session" },
};

const sampleItems: UpcomingItem[] = [
  {
    id: "1",
    kind: "assignment",
    title: "Linear Algebra worksheet",
    subject: "Mathematics",
    due: "Tomorrow",
  },
  {
    id: "2",
    kind: "exam",
    title: "Physics midterm",
    subject: "Science",
    due: "In 3 days",
  },
  {
    id: "3",
    kind: "session",
    title: "CS study group",
    subject: "Computer Science",
    due: "Friday, 4:00 PM",
  },
];

export default function UpcomingModule() {
  return (
    <ul className="flex h-full flex-col gap-1.5 overflow-y-auto">
      {sampleItems.map((item) => {
        const { icon: Icon, label } = kindMeta[item.kind];
        return (
          <li
            key={item.id}
            className="flex items-start gap-2.5 rounded-md border border-line px-3 py-2"
          >
            <span className="mt-0.5 text-muted">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">
                {item.title}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <SubjectTag subject={item.subject} />
                <span className="text-[11px] text-faint">· {label}</span>
              </div>
            </div>
            <span className="shrink-0 text-[11px] font-medium text-muted">
              {item.due}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
