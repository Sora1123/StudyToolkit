import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks · StudyToolkit",
  description: "Track your study tasks.",
};

export default function SubLayout({ children }: LayoutProps<"/ToDo">) {
  return <div className="min-h-full">{children}</div>;
}
