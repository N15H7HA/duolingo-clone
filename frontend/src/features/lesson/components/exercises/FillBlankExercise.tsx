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
      <div className="p-6 sm:p-8 bg-[#F7F7F7] dark:bg-[#18272F] rounded-3xl border-2 border-[#E5E5E5] dark:border-[#263843] text-xl sm:text-2xl font-black text-[#3C3C3C] dark:text-white flex flex-wrap items-center gap-2 shadow-sm">
        <span>{prefix}</span>

        {/* The Drop Gap */}
        <span
          className={clsx(
            "min-w-[110px] px-4 py-2 rounded-2xl border-2 text-center text-lg sm:text-xl font-black transition-all inline-flex items-center justify-center",
            value
              ? "bg-[#DDF4FF] dark:bg-[#142B36] border-[#1CB0F6] text-[#1CB0F6] shadow-sm animate-in zoom-in-95"
              : "bg-white dark:bg-[#131F24] border-dashed border-[#AFAFAF] dark:border-[#8598A3] text-transparent"
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
                "relative flex items-center gap-3 px-5 sm:px-6 py-3 sm:py-3.5 min-h-[48px] rounded-2xl font-extrabold text-base sm:text-lg border-2 border-b-4 transition-all duration-75 shadow-sm touch-manipulation",
                disabled ? "cursor-default" : "cursor-pointer active:translate-y-[2px] active:border-b-2",
                isSelected
                  ? "bg-[#DDF4FF] dark:bg-[#142B36] border-[#1CB0F6] border-b-[#1899D6] text-[#1CB0F6]"
                  : "bg-white dark:bg-[#18272F] border-[#E5E5E5] dark:border-[#263843] hover:bg-[#F7F7F7] dark:hover:bg-[#1F333D] text-[#4B4B4B] dark:text-white"
              )}
            >
              <span>{opt.text}</span>
              <span
                className={clsx(
                  "text-xs font-black px-2 py-0.5 rounded-lg border",
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
