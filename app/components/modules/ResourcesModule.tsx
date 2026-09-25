"use client";

import {
  FileText,
  FileSpreadsheet,
  Briefcase,
  Sigma,
  ExternalLink,
  LucideIcon,
} from "lucide-react";
import { Subject, subjectColor } from "@/app/components/ui/subjects";

/**
 * Recent Resources — recently opened study materials.
 *
 * No resource backend exists yet; this uses clearly-structured local sample
 * data. Replace `sampleResources` with a fetch when a resources API is added.
 */

type Kind = "notes" | "sheet" | "case" | "practice";

interface Resource {
  id: string;
  name: string;
  subject: Subject;
  kind: Kind;
  opened: string;
}

const kindIcon: Record<Kind, LucideIcon> = {
  notes: FileText,
  sheet: FileSpreadsheet,
  case: Briefcase,
  practice: Sigma,
};

const sampleResources: Resource[] = [
  {
    id: "1",
    name: "Linear Algebra Notes",
    subject: "Mathematics",
    kind: "notes",
    opened: "2h ago",
  },
  {
    id: "2",
    name: "Physics Formula Sheet",
    subject: "Science",
    kind: "sheet",
    opened: "Yesterday",
  },
  {
    id: "3",
    name: "IB Business Case Study",
    subject: "Business",
    kind: "case",
    opened: "2 days ago",
  },
  {
    id: "4",
    name: "Calculus Practice Questions",
    subject: "Mathematics",
    kind: "practice",
    opened: "Last week",
  },
];

export default function ResourcesModule() {
  return (
    <ul className="flex h-full flex-col gap-0.5 overflow-y-auto">
      {sampleResources.map((r) => {
        const Icon = kindIcon[r.kind];
        const color = subjectColor[r.subject];
        return (
          <li key={r.id}>
            <button
              className="group/res flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2"
              title={r.name}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${color}18`, color }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-text">
                  {r.name}
                </span>
                <span className="block truncate text-[11px] text-faint">
                  {r.subject} · {r.opened}
                </span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-faint opacity-0 transition-opacity group-hover/res:opacity-100" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
