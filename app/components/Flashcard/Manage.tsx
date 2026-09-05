import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash, Edit3 } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export default function ManageMode({cards, setCards, currentIndex, setCurrentIndex}) {
  // Add state
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  const addCard = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    try {
      const res = await fetch("/api/Flashcards", {
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
      await fetch(`/api/Flashcards/${id}`, { method: "DELETE" });
      setCards((prev) => prev.filter((c) => c.id !== id));
      if (currentIndex >= cards.length - 1) {
        setCurrentIndex(Math.max(0, cards.length - 2));
      }
    } catch (e) {
      console.error("Failed to delete card:", e);
    }
  };

  return (
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
  );
}
