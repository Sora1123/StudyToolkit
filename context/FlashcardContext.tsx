"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardContextType {
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean | ((prev: boolean) => boolean)) => void;
  cards: Flashcard[];
  setCards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(
  undefined,
);

export const FlashcardProvider = ({ children }: { children: ReactNode }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <FlashcardContext.Provider
      value={{
        isFlipped,
        setIsFlipped,
        cards,
        setCards,
        currentIndex,
        setCurrentIndex,
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
