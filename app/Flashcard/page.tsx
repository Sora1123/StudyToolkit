"use client";

import { useState } from "react";
import Flashcard from "@/app/components/Flashcard/Flashcard";
import { useFlashcard } from "@/context/FlashcardContext";
import Link from "next/link";
import { Plus, Brain } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
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
              {cards.length === 0 ? (
                <div className="text-center py-20 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
                  <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No cards yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Switch to Manage mode to add your first flashcard.
                  </p>
                  <button
                    onClick={() => setMode("manage")}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
                  >
                    <Plus className="w-4 h-4" /> Add a Card
                  </button>
                </div>
              ) : (
                <Flashcard />
              )}
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

        <style
          dangerouslySetInnerHTML={{
            __html: `
              .perspective-1000 {
                perspective: 1000px;
              }
              .preserve-3d {
                transform-style: preserve-3d;
              }
              .backface-hidden {
                backface-visibility: hidden;
              }
            `,
          }}
        />
      </div>

      <Link href="/">To home</Link>
    </>
  );
}
