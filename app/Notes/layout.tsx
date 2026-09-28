import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes · StudyToolkit",
  description: "Write Markdown and LaTeX notes with a live preview.",
};

export default function SubLayout({ children }: LayoutProps<"/Notes">) {
  return <div className="min-h-full">{children}</div>;
}
