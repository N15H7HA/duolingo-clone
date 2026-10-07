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
        <div className="relative bg-[#F7F7F7] dark:bg-[#18272F] border-2 border-[#E5E5E5] dark:border-[#263843] rounded-2xl p-4 sm:p-5 flex items-center gap-3 shadow-sm">
          <button
            type="button"
            onClick={playSourceAudio}
            className="p-2 rounded-xl bg-[#DDF4FF] dark:bg-[#142B36] text-[#1CB0F6] hover:brightness-105 active:scale-95 transition cursor-pointer"
            title="Listen to audio"
          >
            <Volume2 className="w-5 h-5 fill-[#1CB0F6] stroke-[#1CB0F6]" />
          </button>
          <span className="text-lg sm:text-xl font-extrabold text-[#3C3C3C] dark:text-white">
            {exercise.source_text}
          </span>
          {/* Bubble tail */}
          <div className="absolute -left-2 top-5 w-3 h-3 bg-[#F7F7F7] dark:bg-[#18272F] border-l-2 border-b-2 border-[#E5E5E5] dark:border-[#263843] transform rotate-45" />
        </div>
      </div>

      {/* Target Answer Line / Slots */}
      <div className="min-h-[76px] border-b-2 border-[#E5E5E5] dark:border-[#263843] pb-3 flex flex-wrap gap-2.5 items-center">
        {selectedWords.length === 0 ? (
          <span className="text-[#AFAFAF] dark:text-[#8598A3] text-sm font-bold pl-2 italic">
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
                "bg-white dark:bg-[#18272F] text-[#4B4B4B] dark:text-white border-2 border-[#E5E5E5] dark:border-[#263843] border-b-4 font-extrabold text-base min-h-[48px] px-4 py-2.5 rounded-xl shadow-sm transition-all duration-75 animate-in zoom-in-95 touch-manipulation",
                disabled
                  ? "cursor-default opacity-80"
                  : "hover:bg-[#F7F7F7] dark:hover:bg-[#1F333D] active:translate-y-1 active:border-b-2 cursor-pointer"
              )}
            >
              {word}
            </button>
          ))
        )}
      </div>

      {/* Word Bank with Recessed Placeholder Slots */}
      <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center pt-2 min-h-[110px]">
        {bankSlots.map(({ word, isPlaced, originalIndex }) => (
          <div key={`bank-${word}-${originalIndex}`} className="relative">
            {/* Recessed placeholder slot left in the bank */}
            {isPlaced && (
              <div className="border-2 border-dashed border-[#E5E5E5] dark:border-[#263843] bg-[#F7F7F7] dark:bg-[#131F24] rounded-xl min-h-[48px] px-4 py-2.5 flex items-center justify-center font-extrabold text-base text-transparent select-none pointer-events-none shadow-inner">
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
                  "bg-white dark:bg-[#18272F] text-[#4B4B4B] dark:text-white border-2 border-[#E5E5E5] dark:border-[#263843] border-b-4 font-extrabold text-base min-h-[48px] px-4 py-2.5 rounded-xl shadow-sm transition-all duration-75 touch-manipulation",
                  disabled
                    ? "cursor-default opacity-80"
                    : "hover:bg-[#F7F7F7] dark:hover:bg-[#1F333D] active:translate-y-1 active:border-b-2 cursor-pointer"
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
