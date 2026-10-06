"use client";

import React, { useState, useEffect } from "react";
import { StrippedExercise, StrippedOption } from "@/types";
import clsx from "clsx";

interface MatchPairsProps {
  exercise: StrippedExercise;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function MatchPairsExercise({
  exercise,
  onChange,
  disabled = false,
}: MatchPairsProps) {
  const [selectedLeft, setSelectedLeft] = useState<StrippedOption | null>(null);
  const [selectedRight, setSelectedRight] = useState<StrippedOption | null>(null);
  const [matchedPairKeys, setMatchedPairKeys] = useState<string[]>([]);
  const [mismatched, setMismatched] = useState<boolean>(false);

  const leftOptions = exercise.options.filter((o) => o.side === "left");
  const rightOptions = exercise.options.filter((o) => o.side === "right");

  // If left/right sides aren't marked, divide in half
  const half = Math.ceil(exercise.options.length / 2);
  const finalLeft = leftOptions.length > 0 ? leftOptions : exercise.options.slice(0, half);
  const finalRight = rightOptions.length > 0 ? rightOptions : exercise.options.slice(half);

  // Check matching whenever both sides are selected
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft.pair_key && selectedLeft.pair_key === selectedRight.pair_key) {
        // Matched!
        const newMatched = [...matchedPairKeys, selectedLeft.pair_key];
        setMatchedPairKeys(newMatched);
        setSelectedLeft(null);
        setSelectedRight(null);

        // Check if all pairs are completed
        const totalUniquePairs = new Set(exercise.options.map((o) => o.pair_key).filter(Boolean)).size;
        if (newMatched.length >= (totalUniquePairs || finalLeft.length)) {
          onChange("All matched");
        }
      } else {
        // Mismatch wobble
        setMismatched(true);
        const timer = setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setMismatched(false);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedLeft, selectedRight, matchedPairKeys, exercise.options, finalLeft.length, onChange]);

  return (
    <div className="space-y-4 max-w-xl mx-auto w-full select-none">
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-3">
          {finalLeft.map((opt) => {
            const isMatched = opt.pair_key ? matchedPairKeys.includes(opt.pair_key) : false;
            const isSelected = selectedLeft?.id === opt.id;

            if (isMatched) {
              return (
                <div
                  key={opt.id}
                  className="p-4 rounded-2xl font-extrabold text-sm sm:text-base text-center bg-feedbackGreenBg/40 text-featherGreen/40 border-2 border-dashed border-featherGreen/30 pointer-events-none select-none"
                >
                  {opt.text}
                </div>
              );
            }

            return (
              <button
                key={opt.id}
                disabled={disabled || isMatched}
                onClick={() => setSelectedLeft(opt)}
                className={clsx(
                  "w-full p-4 rounded-2xl font-extrabold text-sm sm:text-base text-center border-2 border-b-[5px] transition-all duration-75",
                  isSelected
                    ? mismatched
                      ? "bg-feedbackRedBg border-cardinal border-b-cardinalShadow text-cardinal animate-shake"
                      : "bg-selectedCardBg border-macaw border-b-macawShadow text-macaw"
                    : "bg-snow border-swan border-b-swan hover:bg-polar text-eel active:translate-y-[2px] active:border-b-[3px]"
                )}
              >
                {opt.text}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {finalRight.map((opt) => {
            const isMatched = opt.pair_key ? matchedPairKeys.includes(opt.pair_key) : false;
            const isSelected = selectedRight?.id === opt.id;

            if (isMatched) {
              return (
                <div
                  key={opt.id}
                  className="p-4 rounded-2xl font-extrabold text-sm sm:text-base text-center bg-feedbackGreenBg/40 text-featherGreen/40 border-2 border-dashed border-featherGreen/30 pointer-events-none select-none"
                >
                  {opt.text}
                </div>
              );
            }

            return (
              <button
                key={opt.id}
                disabled={disabled || isMatched}
                onClick={() => setSelectedRight(opt)}
                className={clsx(
                  "w-full p-4 rounded-2xl font-extrabold text-sm sm:text-base text-center border-2 border-b-[5px] transition-all duration-75",
                  isSelected
                    ? mismatched
                      ? "bg-feedbackRedBg border-cardinal border-b-cardinalShadow text-cardinal animate-shake"
                      : "bg-selectedCardBg border-macaw border-b-macawShadow text-macaw"
                    : "bg-snow border-swan border-b-swan hover:bg-polar text-eel active:translate-y-[2px] active:border-b-[3px]"
                )}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
