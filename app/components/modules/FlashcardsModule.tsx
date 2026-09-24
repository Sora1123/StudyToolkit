"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Layers } from "lucide-react";
import { SubjectTag } from "@/app/components/ui/Tags";
import { Subject, subjectFromString } from "@/app/components/ui/subjects";

/**
 * Compact Flashcards module — reuses the existing /api/Flashcards data
 * ({ id, front, back }). Subject is an optional UI-level field; the backend
 * doesn't store it yet, so we default to "General" and keep it easy to extend.
 * Navigation/flip state is kept local so this module never conflicts with the
 * shared FlashcardContext used by the full /Flashcard page.
 */

interface ApiCard {
  id: string;
  front: string;
  back: string;
  subject?: string;
}

export default function FlashcardsModule() {
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/Flashcards");
        const data = await res.json();
        if (!cancelled) setCards(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch cards:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const go = (delta: number) => {
    setShowAnswer(false);
    setIndex((i) => Math.min(cards.length - 1, Math.max(0, i + delta)));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-faint">Loading…</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Layers className="mb-2 h-8 w-8 text-faint" />
        <p className="text-sm text-muted">No flashcards yet.</p>
      </div>
    );
  }

  const card = cards[index] || cards[0];
  const subject: Subject = subjectFromString(card.subject);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between">
        <SubjectTag subject={subject} />
        <span className="text-xs font-medium text-faint">
          {index + 1} / {cards.length}
        </span>
      </div>

      <button
        onClick={() => setShowAnswer((s) => !s)}
        className="flex flex-1 flex-col items-center justify-center rounded-md border border-line bg-surface-2 px-4 py-4 text-center transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <p className="text-[15px] font-medium leading-snug text-text">
          {showAnswer ? card.back : card.front}
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent">
          {showAnswer ? (
            <>
              <EyeOff className="h-3.5 w-3.5" /> Hide answer
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" /> Show answer
            </>
          )}
        </span>
      </button>

      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous card"
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1">
          {cards.slice(0, 10).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-3 bg-accent" : "w-1.5 bg-line-strong"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          disabled={index === cards.length - 1}
          aria-label="Next card"
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
