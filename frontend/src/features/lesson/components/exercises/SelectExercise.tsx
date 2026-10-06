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

  return (
    <div className="space-y-4 max-w-xl mx-auto w-full select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                "relative flex items-center justify-between p-5 rounded-2xl font-extrabold text-base sm:text-lg text-left border-2 border-b-4 transition-all duration-75",
                disabled ? "cursor-default" : "cursor-pointer active:translate-y-[2px] active:border-b-2",
                isSelected
                  ? "bg-[#DDF4FF] border-[#1CB0F6] border-b-[#1899D6] text-[#1CB0F6] shadow-sm"
                  : "bg-white border-[#E5E5E5] border-b-[#CCCCCC] hover:bg-[#F7F7F7] text-[#4B4B4B]"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {exercise.image_key === "boy"
                    ? "👦"
                    : exercise.image_key === "girl"
                    ? "👧"
                    : exercise.image_key === "cat"
                    ? "🐱"
                    : exercise.image_key === "dog"
                    ? "🐶"
                    : exercise.image_key === "sun"
                    ? "☀️"
                    : exercise.image_key === "hand_wave"
                    ? "👋"
                    : "💡"}
                </span>
                <span>{opt.text}</span>
              </div>

              {/* Number key shortcut badge */}
              <span
                className={clsx(
                  "text-xs font-black px-2.5 py-1 rounded-lg border",
                  isSelected
                    ? "border-[#1CB0F6] text-[#1CB0F6] bg-white"
                    : "border-[#E5E5E5] text-[#777777] bg-[#F7F7F7]"
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
