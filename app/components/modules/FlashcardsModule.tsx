"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Layers, Plus, X } from "lucide-react";
import { SubjectTag } from "@/app/components/ui/Tags";
import { Subject, subjectFromString } from "@/app/components/ui/subjects";

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
  const [flipped, setFlipped] = useState(false);
  const [adding, setAdding] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

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

  const go = useCallback(
    (delta: number) => {
      setFlipped(false);
      setIndex((i) =>
        Math.min(Math.max(0, cards.length - 1), Math.max(0, i + delta)),
      );
    },
    [cards.length],
  );

  // Keyboard support — active while the module has focus (click it to focus).
  // Up/Down flip the card; Left/Right change cards.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = rootRef.current;
      const active = el ? el.contains(document.activeElement) : false;
      if (!active || adding) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        go(-1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [go, adding]);

  const addCard = async () => {
    if (!front.trim() || !back.trim()) return;
    try {
      const res = await fetch("/api/Flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: front.trim(), back: back.trim() }),
      });
      const created: ApiCard = await res.json();
      setCards((prev) => {
        const next = [...prev, created];
        setIndex(next.length - 1);
        return next;
      });
      setFront("");
      setBack("");
      setAdding(false);
      setFlipped(false);
    } catch (e) {
      console.error("Failed to add card:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-faint">Loading…</p>
      </div>
    );
  }

  const card = cards[index] || cards[0];
  const subject: Subject = card ? subjectFromString(card.subject) : "General";

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      onPointerDownCapture={() => rootRef.current?.focus()}
      className="flex h-full flex-col outline-none"
    >
      <div className="mb-2 flex items-center justify-between">
        {card ? <SubjectTag subject={subject} /> : <span />}
        <div className="flex items-center gap-2">
          {cards.length > 0 && (
            <span className="text-xs font-medium text-faint">
              {index + 1} / {cards.length}
            </span>
          )}
          <button
            onClick={() => {
              setAdding((a) => !a);
              setFlipped(false);
            }}
            aria-label={adding ? "Cancel add card" : "Add card"}
            title={adding ? "Cancel" : "Add card"}
            className="rounded-md p-1 text-muted transition-colors hover:bg-surface-2 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {adding ? (
        <div className="flex flex-1 flex-col gap-2">
          <input
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Front (question)"
            aria-label="Front"
            className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none placeholder:text-faint focus:border-accent"
          />
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Back (answer)"
            aria-label="Back"
            className="flex-1 resize-none rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none placeholder:text-faint focus:border-accent"
          />
          <button
            onClick={addCard}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Add card
          </button>
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Layers className="mb-2 h-8 w-8 text-faint" />
          <p className="text-sm text-muted">No flashcards yet.</p>
          <button
            onClick={() => setAdding(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" /> Add a card
          </button>
        </div>
      ) : (
        <>
          {/* 3D flip card */}
          <div
            className="relative flex-1 cursor-pointer"
            style={{ perspective: 1000 }}
            onClick={() => setFlipped((f) => !f)}
            role="button"
            aria-label="Flip card"
          >
            <motion.div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateX: flipped ? 180 : 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-line bg-surface-2 p-4 text-center"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <span className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-faint">
                  Question
                </span>
                <p className="text-[15px] font-medium leading-snug text-text">
                  {card.front}
                </p>
              </div>
              {/* Back */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-accent/30 bg-accent-soft p-4 text-center"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateX(180deg)",
                }}
              >
                <span className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-accent/70">
                  Answer
                </span>
                <p className="text-[15px] font-medium leading-snug text-accent">
                  {card.back}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Circle dots — selected is an oval */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {cards.slice(0, 12).map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all duration-200"
                style={{
                  width: i === index ? 14 : 6,
                  backgroundColor:
                    i === index ? "var(--accent)" : "var(--line-strong)",
                }}
              />
            ))}
            {cards.length > 12 && (
              <span className="text-[10px] text-faint">+{cards.length - 12}</span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label="Previous card"
              className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[10px] text-faint">↑/↓ flip · ←/→ next</span>
            <button
              onClick={() => go(1)}
              disabled={index === cards.length - 1}
              aria-label="Next card"
              className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
