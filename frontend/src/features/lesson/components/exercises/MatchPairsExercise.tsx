"use client";

import React, { useState, useEffect, useMemo } from "react";
import { StrippedExercise, StrippedOption } from "@/types";
import clsx from "clsx";

interface MatchPairsProps {
  exercise: StrippedExercise;
  onChange: (val: string) => void;
  disabled?: boolean;
}

function fisherYatesShuffle<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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

  // 1. Extract and decouple left and right columns independently
  const { leftColumn, rightColumn } = useMemo(() => {
    let left = exercise.options.filter((o) => o.side === "left");
    let right = exercise.options.filter((o) => o.side === "right");

    if (left.length === 0 || right.length === 0) {
      const half = Math.ceil(exercise.options.length / 2);
      left = exercise.options.slice(0, half);
      right = exercise.options.slice(half);
    }

    // 2. Shuffle independently using Fisher-Yates algorithm
    let shuffledLeft = fisherYatesShuffle(left);
    let shuffledRight = fisherYatesShuffle(right);

    // 3. Ensure no item is directly horizontally adjacent to its matching counterpart at initial render
    if (shuffledLeft.length > 1 && shuffledRight.length > 1) {
      for (let i = 0; i < Math.min(shuffledLeft.length, shuffledRight.length); i++) {
        if (
          shuffledLeft[i].pair_key &&
          shuffledRight[i].pair_key &&
          shuffledLeft[i].pair_key === shuffledRight[i].pair_key
        ) {
          const swapIdx = (i + 1) % shuffledRight.length;
          const temp = shuffledRight[i];
          shuffledRight[i] = shuffledRight[swapIdx];
          shuffledRight[swapIdx] = temp;
        }
      }
    }

    return { leftColumn: shuffledLeft, rightColumn: shuffledRight };
  }, [exercise.id, exercise.options]);

  // Handle match verification
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (
        selectedLeft.pair_key &&
        selectedRight.pair_key &&
        selectedLeft.pair_key === selectedRight.pair_key
      ) {
        // Matched pair
        const newMatched = [...matchedPairKeys, selectedLeft.pair_key];
        setMatchedPairKeys(newMatched);
        setSelectedLeft(null);
        setSelectedRight(null);

        const totalPairs = Math.max(leftColumn.length, rightColumn.length);
        if (newMatched.length >= totalPairs) {
          onChange("All matched");
        }
      } else {
        // Mismatched pair - shake & clear selection
        setMismatched(true);
        const timer = setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setMismatched(false);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedLeft, selectedRight, matchedPairKeys, leftColumn.length, rightColumn.length, onChange]);

  const renderTile = (
    opt: StrippedOption,
    isSelected: boolean,
    onSelect: () => void,
    side: "left" | "right"
  ) => {
    const isMatched = opt.pair_key ? matchedPairKeys.includes(opt.pair_key) : false;

    return (
      <button
        key={`${side}-${opt.id}`}
        type="button"
        disabled={disabled || isMatched || (mismatched && isSelected)}
        onClick={onSelect}
        className={clsx(
          "w-full p-4 rounded-2xl font-extrabold text-sm sm:text-base text-center transition-all duration-150 select-none",
          isMatched
            ? "opacity-30 pointer-events-none scale-95 border-2 border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
            : isSelected
            ? mismatched
              ? "bg-[#FFDFE0] dark:bg-[#33181A] border-2 border-b-4 border-[#EA2B2B] text-[#EA2B2B] dark:text-[#FF4B4B] animate-shake"
              : "border-2 border-b-4 border-[#1CB0F6] bg-[#DDF4FF] dark:bg-[#142B36] text-[#1CB0F6] ring-2 ring-[#1CB0F6]/30 cursor-pointer"
            : "bg-white dark:bg-[#18272F] border-2 border-[#E5E5E5] dark:border-[#263843] border-b-4 text-[#4B4B4B] dark:text-white cursor-pointer hover:bg-[#F7F7F7] dark:hover:bg-[#1F333D] active:translate-y-[2px] active:border-b-2"
        )}
      >
        {opt.text}
      </button>
    );
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto w-full select-none">
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-3">
          {leftColumn.map((opt) =>
            renderTile(
              opt,
              selectedLeft?.id === opt.id,
              () => !mismatched && setSelectedLeft(opt),
              "left"
            )
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {rightColumn.map((opt) =>
            renderTile(
              opt,
              selectedRight?.id === opt.id,
              () => !mismatched && setSelectedRight(opt),
              "right"
            )
          )}
        </div>
      </div>
    </div>
  );
}
