"use client";

import Link from "next/link";
import Timer from "@/app/components/Timer";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center gap-6">
        <Link className="flex justify-center" href="/Pomodoro">
          To Pomodoro Timer
        </Link>
        <Timer />
      </div>
      <Link className="flex justify-center" href="/Flashcard">
        To Flashcard
      </Link>
    </>
  );
}
