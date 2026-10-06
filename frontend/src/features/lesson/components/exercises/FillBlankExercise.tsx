"use client";

import React from "react";
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
            "min-w-[100px] px-4 py-1.5 rounded-2xl border-2 text-center text-lg sm:text-xl font-black transition-all inline-flex items-center justify-center",
            value
              ? "bg-selectedCardBg border-macaw text-macaw shadow-sm animate-in zoom-in-95"
              : "bg-snow border-dashed border-swan text-transparent"
          )}
        >
          {value || "placeholder"}
        </span>

        <span>{suffix}</span>
      </div>

      {/* Choice Chips */}
      <div className="flex flex-wrap gap-3 justify-center">
        {exercise.options.map((opt) => {
          const isSelected = value === opt.text;

          return (
            <button
              key={opt.id}
              disabled={disabled}
              onClick={() => onChange(opt.text)}
              className={clsx(
                "px-6 py-3.5 rounded-2xl font-extrabold text-base sm:text-lg border-2 border-b-[5px] transition-all duration-75 shadow-sm",
                disabled ? "cursor-default" : "cursor-pointer active:translate-y-[2px] active:border-b-[3px]",
                isSelected
                  ? "bg-selectedCardBg border-macaw border-b-macawShadow text-macaw"
                  : "bg-snow border-swan border-b-swan hover:bg-polar text-eel"
              )}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
