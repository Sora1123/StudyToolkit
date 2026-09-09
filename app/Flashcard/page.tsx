"use client";

import { useState } from "react";
import Flashcard from "@/app/components/Flashcard/Flashcard";
import { useFlashcard } from "@/context/FlashcardContext";
import Link from "next/link";
import ManageMode from "@/app/components/Flashcard/ManageMode";

export default function Home() {
  const [mode, setMode] = useState<"study" | "manage">("study");
  const {
    isFlipped,
    setIsFlipped,
    cards,
    setCards,
    currentIndex,
    setCurrentIndex,
  } = useFlashcard();

  return (
    <>
      <div className="min-h-screen text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <header className="sticky top-0 z-10 w-full">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  setMode("study");
                  setIsFlipped(false);
                }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  mode === "study"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Study
              </button>
              <button
                onClick={() => setMode("manage")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  mode === "manage"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Manage
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
          {mode === "study" ? (
            <div className="w-full max-w-xl flex flex-col items-center">
              <Flashcard onEmptyAction={() => setMode("manage")} />
            </div>
          ) : (
            <ManageMode
              cards={cards}
              setCards={setCards}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
            />
          )}
        </main>
      </div>
      <Link href="/">To home</Link>
    </>
  );
}
