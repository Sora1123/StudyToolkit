import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Trash,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Brain,
  Edit3,
} from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export default function App() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"study" | "manage">("study");

  // Study state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Add state
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/cards");
      const data = await res.json();
      setCards(data);
    } catch (e) {
      console.error("Failed to fetch cards:", e);
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      await fetch(`/api/cards/${id}`, { method: "DELETE" });
      setCards((prev) => prev.filter((c) => c.id !== id));
      if (currentIndex >= cards.length - 1) {
        setCurrentIndex(Math.max(0, cards.length - 2));
      }
    } catch (e) {
      console.error("Failed to delete card:", e);
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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-lg tracking-tight">
            <Brain className="w-6 h-6" />
            <span>Flashcards</span>
          </div>

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
              <>
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
                  className="w-full aspect-[4/3] perspective-1000 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <motion.div
                    className="w-full h-full relative preserve-3d"
                    animate={{ rotateX: isFlipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-center text-center">
                      <p className="text-2xl font-medium text-gray-800 leading-relaxed">
                        {cards[currentIndex].front}
                      </p>
                    </div>

                    {/* Back */}
                    <div
                      className="absolute w-full h-full backface-hidden bg-indigo-600 p-8 rounded-3xl shadow-[0_8px_30px_rgb(99,102,241,0.2)] flex items-center justify-center text-center"
                      style={{ transform: "rotateX(180deg)" }}
                    >
                      <p className="text-2xl font-medium text-white leading-relaxed">
                        {cards[currentIndex].back}
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
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-indigo-600 w-4" : "bg-gray-200"}`}
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
              </>
            )}
          </div>
        ) : (
          <div className="w-full grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6 text-gray-900">
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-semibold text-lg tracking-tight">
                    Create Card
                  </h2>
                </div>
                <form onSubmit={addCard} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Front label (Question)
                    </label>
                    <textarea
                      value={newFront}
                      onChange={(e) => setNewFront(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm resize-none h-24"
                      placeholder="e.g. What is the process by which plants make food?"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Back label (Answer)
                    </label>
                    <textarea
                      value={newBack}
                      onChange={(e) => setNewBack(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm resize-none h-24"
                      placeholder="e.g. Photosynthesis"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition"
                  >
                    Add Flashcard
                  </button>
                </form>
              </div>
            </div>

            <div className="md:col-span-3">
              <h2 className="font-semibold text-lg text-gray-900 tracking-tight mb-6">
                Your Cards ({cards.length})
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {cards.map((card) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between group"
                    >
                      <div className="grid sm:grid-cols-2 gap-4 flex-1 mr-4">
                        <div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                            Front
                          </span>
                          <p className="text-gray-900 text-sm">{card.front}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                            Back
                          </span>
                          <p className="text-gray-600 text-sm">{card.back}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-md transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete card"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {cards.length === 0 && (
                  <div className="text-center py-10 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">
                      You haven't added any flashcards yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
  );
}