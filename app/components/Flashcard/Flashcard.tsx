"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Layers,
  Plus,
} from "lucide-react";
import { useFlashcard } from "@/context/FlashcardContext";

interface FlashcardProps {
  onEmptyAction?: () => void;
}

export default function Flashcard({ onEmptyAction }: FlashcardProps) {
  const {
    isFlipped,
    setIsFlipped,
    cards,
    setCards,
    currentIndex,
    setCurrentIndex,
  } = useFlashcard();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/Flashcards");
        const data = await res.json();
        if (!cancelled) setCards(data);
      } catch (e) {
        console.error("Failed to fetch cards:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setCards]);

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="w-full rounded-lg border border-dashed border-line-strong px-6 py-20 text-center">
        <Layers className="mx-auto mb-4 h-10 w-10 text-faint" />
        <h3 className="mb-1 text-base font-medium text-text">No cards yet</h3>
        <p className="mb-6 text-sm text-muted">
          There are no flashcards available to study right now.
        </p>
        {onEmptyAction && (
          <button
            onClick={onEmptyAction}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" /> Add a card
          </button>
        )}
      </div>
    );
  }

  const currentCard = cards[currentIndex] || cards[0];

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-6 flex w-full items-center justify-between text-sm font-medium text-muted">
        <span>
          Card {currentIndex + 1} of {cards.length}
        </span>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1.5 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <RotateCcw className="h-4 w-4" /> Flip
        </button>
      </div>

      <div
        className="w-full cursor-pointer [perspective:1000px]"
        style={{ aspectRatio: "4 / 3" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateX: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div className="absolute flex h-full w-full items-center justify-center rounded-xl border border-line bg-surface p-8 text-center [backface-visibility:hidden]">
            <p className="text-2xl font-medium leading-relaxed text-text">
              {currentCard.front}
            </p>
          </div>
          {/* Back */}
          <div
            className="absolute flex h-full w-full items-center justify-center rounded-xl bg-accent p-8 text-center [backface-visibility:hidden]"
            style={{ transform: "rotateX(180deg)" }}
          >
            <p className="text-2xl font-medium leading-relaxed text-white">
              {currentCard.back}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          aria-label="Previous card"
          className="rounded-full p-3 text-muted transition hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="flex gap-2">
          {cards.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? "w-4 bg-accent" : "w-2 bg-line-strong"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextCard}
          disabled={currentIndex === cards.length - 1}
          aria-label="Next card"
          className="rounded-full p-3 text-muted transition hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
