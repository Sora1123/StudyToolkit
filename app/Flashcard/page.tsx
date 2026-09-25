"use client";

import { useState } from "react";
import Flashcard from "@/app/components/Flashcard/Flashcard";
import { useFlashcard } from "@/app/components/Flashcard/FlashcardContext";
import ManageMode from "@/app/components/Flashcard/ManageMode";
import PageHeader from "@/app/components/ui/PageHeader";

export default function Page() {
  const [mode, setMode] = useState<"study" | "manage">("study");
  const { setIsFlipped, cards, setCards, currentIndex, setCurrentIndex } =
    useFlashcard();

  const tabs = (
    <div className="flex rounded-md bg-surface-2 p-0.5">
      <button
        onClick={() => {
          setMode("study");
          setIsFlipped(false);
        }}
        className={`rounded px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${
          mode === "study"
            ? "bg-surface text-accent shadow-sm"
            : "text-muted hover:text-text"
        }`}
      >
        Study
      </button>
      <button
        onClick={() => setMode("manage")}
        className={`rounded px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${
          mode === "manage"
            ? "bg-surface text-accent shadow-sm"
            : "text-muted hover:text-text"
        }`}
      >
        Manage
      </button>
    </div>
  );

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Flashcards"
        description="Create and study flashcards."
        actions={tabs}
      />
      <main className="mx-auto flex w-full max-w-4xl flex-1 justify-center px-4 py-8">
        {mode === "study" ? (
          <div className="flex w-full max-w-xl flex-col items-center">
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
  );
}
