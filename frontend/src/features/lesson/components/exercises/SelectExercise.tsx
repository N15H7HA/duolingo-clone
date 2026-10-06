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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {exercise.options.map((opt, index) => {
          const isSelected = value === opt.text;
          const badgeNum = index + 1;

          return (
            <button
              key={opt.id}
              disabled={disabled}
              onClick={() => onChange(opt.text)}
              className={clsx(
                "relative flex items-center justify-between p-4 sm:p-5 rounded-2xl font-extrabold text-base sm:text-lg text-left border-2 border-b-[5px] transition-all duration-75",
                disabled ? "cursor-default" : "cursor-pointer active:translate-y-[2px] active:border-b-[3px]",
                isSelected
                  ? "bg-selectedCardBg border-macaw border-b-macawShadow text-macaw shadow-sm"
                  : "bg-snow border-swan border-b-swan hover:bg-polar text-eel"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {exercise.image_key === "boy"
                    ? "👦"
                    : exercise.image_key === "girl"
                    ? "👧"
                    : exercise.image_key === "cat"
                    ? "🐱"
                    : exercise.image_key === "dog"
                    ? "🐶"
                    : "💡"}
                </span>
                <span>{opt.text}</span>
              </div>

              {/* Number key shortcut badge */}
              <span
                className={clsx(
                  "text-xs font-black px-2 py-0.5 rounded-lg border",
                  isSelected
                    ? "border-macaw text-macaw bg-snow"
                    : "border-swan text-wolf bg-polar"
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
