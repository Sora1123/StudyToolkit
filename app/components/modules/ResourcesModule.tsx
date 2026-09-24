"use client";

import { FileText, ExternalLink } from "lucide-react";
import { Subject } from "@/app/components/ui/subjects";
import { subjectColor } from "@/app/components/ui/subjects";

/**
 * Recent Resources — recently opened study materials.
 *
 * No resource backend exists yet; this uses clearly-structured local sample
 * data. Replace `sampleResources` with a fetch when a resources API is added.
 */

interface Resource {
  id: string;
  name: string;
  subject: Subject;
  href?: string;
}

const sampleResources: Resource[] = [
  { id: "1", name: "Linear Algebra Notes", subject: "Mathematics" },
  { id: "2", name: "Physics Formula Sheet", subject: "Science" },
  { id: "3", name: "IB Business Case Study", subject: "Business" },
  { id: "4", name: "Calculus Practice Questions", subject: "Mathematics" },
];

export default function ResourcesModule() {
  return (
    <ul className="flex h-full flex-col gap-1 overflow-y-auto">
      {sampleResources.map((r) => (
        <li key={r.id}>
          <button
            className="group/res flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2"
            title={r.name}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: `${subjectColor[r.subject]}14` }}
            >
              <FileText
                className="h-4 w-4"
                style={{ color: subjectColor[r.subject] }}
              />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-text">
              {r.name}
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-faint opacity-0 transition-opacity group-hover/res:opacity-100" />
          </button>
        </li>
      ))}
    </ul>
  );
}
