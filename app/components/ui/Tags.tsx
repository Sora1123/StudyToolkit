import {
  Priority,
  Subject,
  priorityStyles,
  subjectColor,
} from "./subjects";

export function SubjectTag({ subject }: { subject: Subject }) {
  const color = subjectColor[subject];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {subject}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, className } = priorityStyles[priority];
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}
    >
      {label}
    </span>
  );
}
