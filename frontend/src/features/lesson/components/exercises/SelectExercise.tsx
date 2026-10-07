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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-center">
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
                "border-2 border-b-4 rounded-2xl p-4 flex flex-col items-center justify-between min-w-[160px] h-[210px] relative transition-all duration-75 select-none",
                disabled
                  ? "cursor-default opacity-80"
                  : "cursor-pointer active:translate-y-1 active:border-b-2 hover:bg-[#F7F7F7] dark:hover:bg-[#1F333D]",
                isSelected
                  ? "border-[#1CB0F6] bg-[#DDF4FF] dark:bg-[#142B36] text-[#1CB0F6]"
                  : "bg-white dark:bg-[#18272F] border-[#E5E5E5] dark:border-[#263843] text-[#4B4B4B] dark:text-white"
              )}
            >
              {/* Top empty spacing / padding */}
              <div className="w-full flex justify-start pt-1" />

              {/* Large Center Graphic / Emoji */}
              <div className="my-auto text-5xl sm:text-6xl filter drop-shadow-sm transform hover:scale-105 transition">
                {getEmojiForOption(opt.text, exercise.image_key ?? undefined)}
              </div>

              {/* Option Text Label */}
              <div className="font-extrabold text-base sm:text-lg text-center pb-2 px-2">
                {opt.text}
              </div>

              {/* Keyboard Shortcut Badge in Bottom-Right Corner */}
              <span
                className={clsx(
                  "absolute bottom-3 right-3 text-xs font-black px-2 py-0.5 rounded-lg border transition",
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
