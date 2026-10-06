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
        <div className="relative bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl p-4 sm:p-5 flex items-center gap-3 shadow-sm">
          <button
            type="button"
            className="p-2 rounded-xl bg-[#DDF4FF] text-[#1CB0F6] hover:brightness-105 active:scale-95 transition"
          >
            <Volume2 className="w-5 h-5 fill-[#1CB0F6] stroke-[#1CB0F6]" />
          </button>
          <span className="text-lg sm:text-xl font-black text-[#4B4B4B]">{exercise.source_text}</span>
          {/* Bubble tail */}
          <div className="absolute -left-2 top-5 w-3 h-3 bg-[#F7F7F7] border-l-2 border-b-2 border-[#E5E5E5] transform rotate-45" />
        </div>
      </div>

      {/* Target Answer Line / Slots */}
      <div className="min-h-[72px] border-b-2 border-[#E5E5E5] pb-3 flex flex-wrap gap-2 items-center">
        {selectedWords.length === 0 ? (
          <span className="text-[#777777] text-sm font-bold pl-2 italic">Tap words below to build your answer...</span>
        ) : (
          selectedWords.map((word, idx) => (
            <button
              key={`${word}-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => onRemoveWord(idx)}
              className="bg-white text-[#4B4B4B] font-extrabold text-base px-4 py-2.5 rounded-xl border-2 border-[#E5E5E5] border-b-4 hover:bg-[#F7F7F7] active:translate-y-[2px] active:border-b-2 transition shadow-sm animate-in zoom-in-95 duration-100"
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
              <div className="bg-[#E5E5E5]/50 text-transparent font-extrabold text-base px-4 py-2.5 rounded-xl border-2 border-dashed border-[#CCCCCC] select-none pointer-events-none">
                {word}
              </div>
            )}

            {!isUsed && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAddWord(word)}
                className={clsx(
                  "bg-white text-[#4B4B4B] font-extrabold text-base px-4 py-2.5 rounded-xl border-2 border-[#E5E5E5] border-b-4 hover:bg-[#F7F7F7] active:translate-y-[2px] active:border-b-2 transition shadow-sm",
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
