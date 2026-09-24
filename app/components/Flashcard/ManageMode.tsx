"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash, Edit3 } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}
export interface ManageModeType {
  cards: Flashcard[];
  setCards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function ManageMode({
  cards,
  setCards,
  currentIndex,
  setCurrentIndex,
}: ManageModeType) {
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  const addCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    try {
      const res = await fetch("/api/Flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: newFront, back: newBack }),
      });
      const data = await res.json();
      setCards((prev) => [...prev, data]);
      setNewFront("");
      setNewBack("");
    } catch (e) {
      console.error("Failed to add card:", e);
    }
  };

  const deleteCard = async (id: string) => {
    try {
      await fetch(`/api/Flashcards/${id}`, { method: "DELETE" });
      setCards((prev) => prev.filter((c) => c.id !== id));
      if (currentIndex >= cards.length - 1) {
        setCurrentIndex(Math.max(0, cards.length - 2));
      }
    } catch (e) {
      console.error("Failed to delete card:", e);
    }
  };

  const fieldClass =
    "w-full resize-none rounded-md border border-line bg-surface-2 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-accent focus:bg-surface";

  return (
    <div className="grid w-full gap-8 md:grid-cols-5">
      <div className="space-y-6 md:col-span-2">
        <div className="rounded-lg border border-line bg-surface p-6">
          <div className="mb-6 flex items-center gap-2 text-text">
            <Edit3 className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold tracking-tight">
              Create card
            </h2>
          </div>
          <form onSubmit={addCard} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                Front (question)
              </label>
              <textarea
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                className={`${fieldClass} h-24`}
                placeholder="e.g. What is photosynthesis?"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                Back (answer)
              </label>
              <textarea
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                className={`${fieldClass} h-24`}
                placeholder="e.g. How plants make food from light"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Add flashcard
            </button>
          </form>
        </div>
      </div>

      <div className="md:col-span-3">
        <h2 className="mb-6 text-lg font-semibold tracking-tight text-text">
          Your cards ({cards.length})
        </h2>
        <div className="space-y-3">
          <AnimatePresence>
            {cards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="group flex items-start justify-between rounded-lg border border-line bg-surface p-5"
              >
                <div className="mr-4 grid flex-1 gap-4 sm:grid-cols-2">
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-faint">
                      Front
                    </span>
                    <p className="text-sm text-text">{card.front}</p>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-accent">
                      Back
                    </span>
                    <p className="text-sm text-muted">{card.back}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteCard(card.id)}
                  className="rounded-md p-2 text-muted opacity-0 transition hover:bg-danger-soft hover:text-danger focus:opacity-100 group-hover:opacity-100"
                  title="Delete card"
                  aria-label="Delete card"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {cards.length === 0 && (
            <div className="rounded-lg border border-dashed border-line-strong py-10 text-center">
              <p className="text-sm text-muted">
                You haven&apos;t added any flashcards yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
