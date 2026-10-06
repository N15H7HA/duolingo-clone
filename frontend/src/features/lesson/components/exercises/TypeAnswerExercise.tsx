"use client";

import React from "react";
import { StrippedExercise } from "@/types";
import { Volume2 } from "lucide-react";

interface TypeAnswerProps {
  exercise: StrippedExercise;
  value: string | null;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const SPANISH_SPECIAL_CHARS = ["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"];

export default function TypeAnswerExercise({
  exercise,
  value,
  onChange,
  disabled = false,
}: TypeAnswerProps) {
  const insertChar = (char: string) => {
    if (disabled) return;
    onChange((value || "") + char);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto w-full select-none">
      {/* Source Prompt Card */}
      <div className="flex items-center gap-3 p-4 sm:p-5 bg-polar rounded-2xl border-2 border-swan w-fit shadow-sm">
        <Volume2 className="w-5 h-5 text-macaw cursor-pointer" />
        <span className="text-lg sm:text-xl font-black text-eel">{exercise.source_text}</span>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <textarea
          value={value || ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your translation in Spanish..."
          rows={3}
          className="w-full p-4 sm:p-5 rounded-2xl border-2 border-b-4 border-swan bg-snow text-eel font-extrabold text-lg focus:outline-none focus:border-[#1CB0F6] focus:border-b-[#1899D6] transition shadow-inner resize-none"
        />

        {/* Special Character Virtual Helpers */}
        <div className="flex flex-wrap gap-2 justify-center">
          {SPANISH_SPECIAL_CHARS.map((char) => (
            <button
              key={char}
              type="button"
              disabled={disabled}
              onClick={() => insertChar(char)}
              className="w-10 h-10 rounded-xl bg-snow border-2 border-b-4 border-swan text-eel font-black text-base hover:bg-polar active:translate-y-[2px] active:border-b-2 transition shadow-sm"
            >
              {char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
