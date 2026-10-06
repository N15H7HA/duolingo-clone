"use client";

import React, { useEffect } from "react";
import { StrippedExercise } from "@/types";
import { Volume2 } from "lucide-react";
import clsx from "clsx";

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

  // Compute available bank words by subtracting occurrences in selectedWords
  const bankWords = exercise.options.map((opt) => opt.text);
  const usedCounts: Record<string, number> = {};
  selectedWords.forEach((w) => {
    usedCounts[w] = (usedCounts[w] || 0) + 1;
  });

  const availableBankIndices = bankWords.map((word, idx) => {
    const countBefore = bankWords.slice(0, idx + 1).filter((w) => w === word).length;
    const isUsed = countBefore <= (usedCounts[word] || 0);
    return { word, isUsed, idx };
  });

  return (
    <div className="space-y-6 max-w-xl mx-auto w-full select-none">
      {/* Speech Bubble with Source Text */}
      <div className="flex items-start gap-3">
        <div className="text-4xl filter drop-shadow">🦉</div>
        <div className="relative bg-polar border-2 border-swan rounded-2xl p-4 sm:p-5 flex items-center gap-3 shadow-sm">
          <button
            type="button"
            className="p-2 rounded-xl bg-selectedCardBg text-macaw hover:brightness-105 active:scale-95 transition"
          >
            <Volume2 className="w-5 h-5 fill-macaw stroke-macaw" />
          </button>
          <span className="text-lg sm:text-xl font-black text-eel">{exercise.source_text}</span>
          {/* Bubble tail */}
          <div className="absolute -left-2 top-5 w-3 h-3 bg-polar border-l-2 border-b-2 border-swan transform rotate-45" />
        </div>
      </div>

      {/* Target Answer Line / Slots */}
      <div className="min-h-[72px] border-b-2 border-swan pb-3 flex flex-wrap gap-2 items-center">
        {selectedWords.length === 0 ? (
          <span className="text-wolf text-sm font-bold pl-2 italic">Tap words below to build your answer...</span>
        ) : (
          selectedWords.map((word, idx) => (
            <button
              key={`${word}-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => onRemoveWord(idx)}
              className="bg-snow text-eel font-extrabold text-base px-4 py-2.5 rounded-xl border-2 border-swan border-b-4 hover:bg-polar active:translate-y-[2px] active:border-b-2 transition shadow-sm animate-in zoom-in-95 duration-100"
            >
              {word}
            </button>
          ))
        )}
      </div>

      {/* Word Bank */}
      <div className="flex flex-wrap gap-2.5 justify-center pt-2">
        {availableBankIndices.map(({ word, isUsed, idx }) => (
          <div key={`bank-${idx}`} className="relative">
            {/* Disabled ghost tile placeholder */}
            {isUsed && (
              <div className="bg-swan/50 text-transparent font-extrabold text-base px-4 py-2.5 rounded-xl border-2 border-dashed border-hare/40 select-none pointer-events-none">
                {word}
              </div>
            )}

            {!isUsed && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAddWord(word)}
                className={clsx(
                  "bg-snow text-eel font-extrabold text-base px-4 py-2.5 rounded-xl border-2 border-swan border-b-4 hover:bg-polar active:translate-y-[2px] active:border-b-2 transition shadow-sm",
                  disabled ? "cursor-default" : "cursor-pointer"
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
