import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pomodoro Timer · StudyToolkit",
  description: "Focus in timed study and rest intervals.",
};

export default function SubLayout({ children }: LayoutProps<"/PomodoroTimer">) {
  return <div className="min-h-full">{children}</div>;
}
