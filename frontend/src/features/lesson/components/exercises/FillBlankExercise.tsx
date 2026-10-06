"use client";

import React, { useEffect } from "react";
import { StrippedExercise } from "@/types";
import clsx from "clsx";

interface FillBlankProps {
  exercise: StrippedExercise;
  value: string | null;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function FillBlankExercise({
  exercise,
  value,
  onChange,
  disabled = false,
}: FillBlankProps) {
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

  // Parse sentence around the blank '___'
  const parts = exercise.source_text.split("___");
  const prefix = parts[0] || "";
  const suffix = parts.length > 1 ? parts[1] : "";

  return (
    <div className="space-y-8 max-w-xl mx-auto w-full select-none">
      {/* Sentence with Gap */}
      <div className="p-6 sm:p-8 bg-polar rounded-3xl border-2 border-swan text-xl sm:text-2xl font-black text-eel flex flex-wrap items-center gap-2 shadow-sm">
        <span>{prefix}</span>

        {/* The Drop Gap */}
        <span
          className={clsx(
            "min-w-[110px] px-4 py-2 rounded-2xl border-2 text-center text-lg sm:text-xl font-black transition-all inline-flex items-center justify-center",
            value
              ? "bg-selectedCardBg border-[#1CB0F6] text-[#1CB0F6] shadow-sm animate-in zoom-in-95"
              : "bg-snow border-dashed border-hare/50 text-transparent"
          )}
        >
          {value || "placeholder"}
        </span>

        <span>{suffix}</span>
      </div>

      {/* Choice Chips with Numeric Shortcuts */}
      <div className="flex flex-wrap gap-3.5 justify-center">
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
                "relative flex items-center gap-3 px-6 py-3.5 rounded-2xl font-extrabold text-base sm:text-lg border-2 border-b-4 transition-all duration-75 shadow-sm",
                disabled ? "cursor-default" : "cursor-pointer active:translate-y-[2px] active:border-b-2",
                isSelected
                  ? "bg-selectedCardBg border-[#1CB0F6] border-b-[#1899D6] text-[#1CB0F6]"
                  : "bg-snow border-swan border-b-swan/80 hover:bg-polar text-eel"
              )}
            >
              <span>{opt.text}</span>
              <span
                className={clsx(
                  "text-xs font-black px-2 py-0.5 rounded-lg border",
                  isSelected
                    ? "border-[#1CB0F6] text-[#1CB0F6] bg-snow"
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
