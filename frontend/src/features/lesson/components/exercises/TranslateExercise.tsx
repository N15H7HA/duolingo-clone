"use client";

import React, { useEffect } from "react";
import { StrippedExercise } from "@/types";
import { Volume2 } from "lucide-react";
import clsx from "clsx";

interface PlacedTile {
  id: string;
  text: string;
  originalIndex: number;
}

interface TranslateProps {
  exercise: StrippedExercise;
  selectedWords: string[];
  onAddWord: (word: string) => void;
  onRemoveWord: (index: number) => void;
  onRemoveLastWord: () => void;
  disabled?: boolean;
}

export default function TranslateExercise({
  exercise,
  selectedWords,
  onAddWord,
  onRemoveWord,
  onRemoveLastWord,
  disabled = false,
}: TranslateProps) {
  // Listen for keyboard Backspace to remove last tile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Backspace") {
        onRemoveLastWord();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, onRemoveLastWord]);

  // Audio helper
  const playSourceAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(exercise.source_text);
      utterance.lang = "es-ES";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Compute placed tiles mapping based on selectedWords
  const bankWords = exercise.options.map((opt) => opt.text);
  const usedCountMap: Record<string, number> = {};
  selectedWords.forEach((w) => {
    usedCountMap[w] = (usedCountMap[w] || 0) + 1;
  });

  const bankSlots = bankWords.map((word, idx) => {
    const occurrencesBefore = bankWords.slice(0, idx + 1).filter((w) => w === word).length;
    const isPlaced = occurrencesBefore <= (usedCountMap[word] || 0);
    return { word, isPlaced, originalIndex: idx };
  });

  return (
    <div className="space-y-6 max-w-xl mx-auto w-full select-none">
      {/* Speech Bubble with Source Text */}
      <div className="flex items-start gap-3">
        <div className="text-4xl filter drop-shadow">🦉</div>
        <div className="relative bg-polar border-2 border-swan rounded-2xl p-4 sm:p-5 flex items-center gap-3 shadow-sm">
          <button
            type="button"
            onClick={playSourceAudio}
            className="p-2 rounded-xl bg-selectedCardBg text-macaw hover:brightness-105 active:scale-95 transition cursor-pointer"
            title="Listen to audio"
          >
            <Volume2 className="w-5 h-5 fill-macaw stroke-macaw" />
          </button>
          <span className="text-lg sm:text-xl font-black text-eel">{exercise.source_text}</span>
          {/* Bubble tail */}
          <div className="absolute -left-2 top-5 w-3 h-3 bg-polar border-l-2 border-b-2 border-swan transform rotate-45" />
        </div>
      </div>

      {/* Target Answer Line / Slots */}
      <div className="min-h-[76px] border-b-2 border-swan pb-3 flex flex-wrap gap-2.5 items-center">
        {selectedWords.length === 0 ? (
          <span className="text-wolf text-sm font-bold pl-2 italic">
            Tap words below or press Backspace to edit...
          </span>
        ) : (
          selectedWords.map((word, idx) => (
            <button
              key={`placed-${word}-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => onRemoveWord(idx)}
              className={clsx(
                "bg-snow text-eel border-2 border-swan border-b-4 font-extrabold text-base px-4 py-2.5 rounded-xl shadow-sm transition-all duration-75 animate-in zoom-in-95",
                disabled
                  ? "cursor-default opacity-80"
                  : "hover:bg-polar active:translate-y-1 active:border-b-2 cursor-pointer"
              )}
            >
              {word}
            </button>
          ))
        )}
      </div>

      {/* Word Bank with Recessed Placeholder Slots */}
      <div className="flex flex-wrap gap-3 justify-center pt-2 min-h-[110px]">
        {bankSlots.map(({ word, isPlaced, originalIndex }) => (
          <div key={`bank-${word}-${originalIndex}`} className="relative">
            {/* Recessed placeholder slot left in the bank */}
            {isPlaced && (
              <div className="border-2 border-dashed border-swan bg-polar/50 rounded-xl h-[46px] px-4 py-2.5 flex items-center justify-center font-extrabold text-base text-transparent select-none pointer-events-none shadow-inner">
                {word}
              </div>
            )}

            {/* Active 3D Word Tile */}
            {!isPlaced && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAddWord(word)}
                className={clsx(
                  "bg-snow text-eel border-2 border-swan border-b-4 font-extrabold text-base px-4 py-2.5 rounded-xl shadow-sm transition-all duration-75",
                  disabled
                    ? "cursor-default opacity-80"
                    : "hover:bg-polar active:translate-y-1 active:border-b-2 cursor-pointer"
                )}
              >
                {word}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
