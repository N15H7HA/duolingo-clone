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

  const playAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(exercise.source_text);
      utterance.lang = "es-ES";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto w-full select-none">
      {/* Source Prompt Card */}
      <div className="flex items-center gap-3 p-4 sm:p-5 bg-[#F7F7F7] dark:bg-[#18272F] rounded-2xl border-2 border-[#E5E5E5] dark:border-[#263843] w-fit shadow-sm">
        <button
          type="button"
          onClick={playAudio}
          className="p-2 rounded-xl bg-[#DDF4FF] dark:bg-[#142B36] text-[#1CB0F6] hover:brightness-105 active:scale-95 transition cursor-pointer"
          title="Listen to audio"
        >
          <Volume2 className="w-5 h-5 fill-[#1CB0F6] stroke-[#1CB0F6]" />
        </button>
        <span className="text-lg sm:text-xl font-extrabold text-[#3C3C3C] dark:text-white">
          {exercise.source_text}
        </span>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <textarea
          value={value || ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your translation in Spanish..."
          rows={3}
          className="w-full p-4 sm:p-5 rounded-2xl border-2 border-b-4 border-[#E5E5E5] dark:border-[#263843] bg-white dark:bg-[#18272F] text-[#4B4B4B] dark:text-white font-extrabold text-lg focus:outline-none focus:border-[#1CB0F6] focus:border-b-[#1899D6] transition shadow-inner resize-none placeholder:text-[#AFAFAF] dark:placeholder:text-[#8598A3]"
        />

        {/* Special Character Virtual Helpers */}
        <div className="flex flex-wrap gap-2 justify-center">
          {SPANISH_SPECIAL_CHARS.map((char) => (
            <button
              key={char}
              type="button"
              disabled={disabled}
              onClick={() => insertChar(char)}
              className="min-w-[44px] min-h-[44px] px-2 rounded-xl bg-white dark:bg-[#18272F] border-2 border-b-4 border-[#E5E5E5] dark:border-[#263843] text-[#4B4B4B] dark:text-white font-black text-lg hover:bg-[#F7F7F7] dark:hover:bg-[#1F333D] active:translate-y-[2px] active:border-b-2 transition shadow-sm touch-manipulation flex items-center justify-center"
            >
              {char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
