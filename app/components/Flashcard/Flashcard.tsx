"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Brain,
  Plus,
} from "lucide-react";
import { useFlashcard } from "@/context/FlashcardContext";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

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
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/Flashcards");
      const data = await res.json();
      setCards(data);
    } catch (e) {
      console.error("Failed to fetch cards:", e);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
        <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No cards yet</h3>
        <p className="text-gray-500 mb-6">
          There are no flashcards available to study right now.
        </p>
        {onEmptyAction && (
          <button
            onClick={onEmptyAction}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" /> Add a Card
          </button>
        )}
      </div>
    );
  }

  const currentCard = cards[currentIndex] || cards[0];

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex items-center justify-between w-full text-sm font-medium text-gray-500">
        <span>
          Card {currentIndex + 1} of {cards.length}
        </span>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1.5 hover:text-indigo-600 transition"
        >
          <RotateCcw className="w-4 h-4" /> Flip
        </button>
      </div>

      <div
        className="w-full aspect-4/3 [perspective:1000px] cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative [transform-style:preserve-3d]"
          animate={{ rotateX: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div className="absolute w-full h-full [backface-visibility:hidden] bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-center text-center">
            <p className="text-2xl font-medium text-gray-800 leading-relaxed">
              {currentCard.front}
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute w-full h-full [backface-visibility:hidden] bg-indigo-600 p-8 rounded-3xl shadow-[0_8px_30px_rgb(99,102,241,0.2)] flex items-center justify-center text-center"
            style={{ transform: "rotateX(180deg)" }}
          >
            <p className="text-2xl font-medium text-white leading-relaxed">
              {currentCard.back}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex gap-2">
          {cards.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? "bg-indigo-600 w-4" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextCard}
          disabled={currentIndex === cards.length - 1}
          className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
