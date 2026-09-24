/**
 * Central definitions for subject and priority styling so color is applied
 * consistently and only where it carries meaning (never per-module).
 */

export type Subject =
  | "Mathematics"
  | "Science"
  | "Computer Science"
  | "Humanities"
  | "Business"
  | "General";

export type Priority = "high" | "medium" | "low";

// Subject → CSS variable color (defined in globals.css).
export const subjectColor: Record<Subject, string> = {
  Mathematics: "var(--subject-math)",
  Science: "var(--subject-science)",
  "Computer Science": "var(--subject-cs)",
  Humanities: "var(--subject-humanities)",
  Business: "var(--subject-business)",
  General: "var(--subject-default)",
};

export function subjectFromString(value?: string): Subject {
  if (!value) return "General";
  const known: Subject[] = [
    "Mathematics",
    "Science",
    "Computer Science",
    "Humanities",
    "Business",
    "General",
  ];
  return known.includes(value as Subject) ? (value as Subject) : "General";
}

export const priorityStyles: Record<
  Priority,
  { label: string; className: string }
> = {
  high: {
    label: "High",
    className: "bg-danger-soft text-danger",
  },
  medium: {
    label: "Medium",
    className: "bg-warning-soft text-warning",
  },
  low: {
    label: "Low",
    className: "bg-surface-2 text-muted",
  },
};
