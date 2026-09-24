import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculator · StudyToolkit",
  description: "Graph and compute with Desmos.",
};

export default function SubLayout({ children }: LayoutProps<"/Calculator">) {
  return <div className="min-h-full">{children}</div>;
}
