import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources · StudyToolkit",
  description: "Jump back into your recent study materials.",
};

export default function SubLayout({ children }: LayoutProps<"/Resources">) {
  return <div className="min-h-full">{children}</div>;
}
