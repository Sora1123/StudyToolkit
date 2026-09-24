import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards · StudyToolkit",
  description: "Create and study flashcards.",
};

export default function SubLayout({ children }: LayoutProps<"/Flashcard">) {
  return <div className="min-h-full">{children}</div>;
}
