"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardContextType {
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean | ((prev: boolean) => boolean)) => void;
  cards: Flashcard[];
  setCards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(
  undefined,
);

export const FlashcardProvider = ({ children }) => {
  // const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // useEffect(() => {
  //   fetchCards();
  // }, []);

  // const fetchCards = async () => {
  //   try {
  //     const res = await fetch("/api/Flashcards");
  //     const data = await res.json();
  //     setCards(data);
  //   } catch (e) {
  //     console.error("Failed to fetch cards:", e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <FlashcardContext.Provider
      value={{
        isFlipped,
        setIsFlipped,
        cards,
        setCards,
        currentIndex,
        setCurrentIndex,
        // loading
      }}
    >
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcard = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error("useFlashcard must be used within a FlashcardProvider");
  }
  return context;
};
