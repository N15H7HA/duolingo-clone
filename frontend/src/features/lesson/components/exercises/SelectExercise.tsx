"use client";

import React, { useEffect } from "react";
import { StrippedExercise } from "@/types";
import clsx from "clsx";

interface ExerciseProps {
  exercise: StrippedExercise;
  value: string | null;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function SelectExercise({
  exercise,
  value,
  onChange,
  disabled = false,
}: ExerciseProps) {
  // Numeric keyboard shortcut listener (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= exercise.options.length) {
        onChange(exercise.options[num - 1].text);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exercise.options, disabled, onChange]);

  const getEmojiForOption = (text: string, imageKey?: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("boy") || lower.includes("niño")) return "👦";
    if (lower.includes("girl") || lower.includes("niña") || lower.includes("mujer")) return "👧";
    if (lower.includes("cat") || lower.includes("gato")) return "🐱";
    if (lower.includes("dog") || lower.includes("perro")) return "🐶";
    if (lower.includes("apple") || lower.includes("manzana")) return "🍎";
    if (lower.includes("water") || lower.includes("agua")) return "💧";
    if (lower.includes("bread") || lower.includes("pan")) return "🍞";
    if (lower.includes("milk") || lower.includes("leche")) return "🥛";
    if (lower.includes("sun") || lower.includes("sol")) return "☀️";
    if (lower.includes("hello") || lower.includes("hola") || lower.includes("adios")) return "👋";

    if (imageKey === "boy") return "👦";
    if (imageKey === "girl") return "👧";
    if (imageKey === "cat") return "🐱";
    if (imageKey === "dog") return "🐶";
    if (imageKey === "sun") return "☀️";
    if (imageKey === "hand_wave") return "👋";

    return "💡";
  };

  return (
    <div className="max-w-2xl mx-auto w-full select-none">
      {/* Desktop 3-column grid / Mobile vertically-stacked tactile pills */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4 justify-center w-full max-w-sm sm:max-w-none mx-auto">
        {exercise.options.map((opt, index) => {
          const isSelected = value === opt.text;
          const badgeNum = index + 1;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.text)}
              className={clsx(
                "border-2 border-b-4 rounded-2xl p-3 sm:p-4 flex flex-row sm:flex-col items-center justify-between min-h-[58px] sm:min-w-[160px] sm:h-[210px] relative transition-all duration-75 select-none touch-manipulation",
                disabled
                  ? "cursor-default opacity-80"
                  : "cursor-pointer active:translate-y-1 active:border-b-2 hover:bg-[#F7F7F7] dark:hover:bg-[#1F333D]",
                isSelected
                  ? "border-[#1CB0F6] bg-[#DDF4FF] dark:bg-[#142B36] text-[#1CB0F6]"
                  : "bg-white dark:bg-[#18272F] border-[#E5E5E5] dark:border-[#263843] text-[#4B4B4B] dark:text-white"
              )}
            >
              {/* Option Left on Mobile / Center Graphic on Desktop */}
              <div className="flex items-center gap-3 sm:flex-col sm:my-auto">
                <span className="text-3xl sm:text-6xl filter drop-shadow-sm transform hover:scale-105 transition">
                  {getEmojiForOption(opt.text, exercise.image_key ?? undefined)}
                </span>
                <span className="font-extrabold text-base sm:text-lg text-left sm:text-center sm:pb-2 sm:px-2">
                  {opt.text}
                </span>
              </div>

              {/* Keyboard Shortcut Badge */}
              <span
                className={clsx(
                  "sm:absolute sm:bottom-3 sm:right-3 text-xs font-black px-2 py-0.5 rounded-lg border transition shrink-0",
                  isSelected
                    ? "border-[#1CB0F6] text-[#1CB0F6] bg-white dark:bg-[#142B36]"
                    : "border-[#E5E5E5] dark:border-[#263843] text-[#777777] dark:text-[#8598A3] bg-[#F7F7F7] dark:bg-[#18272F]"
                )}
              >
                {badgeNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
