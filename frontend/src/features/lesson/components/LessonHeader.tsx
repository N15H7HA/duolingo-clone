"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Heart, Crown, Timer, Zap, Sparkles } from "lucide-react";
import Button3D from "@/components/ui/Button3D";
import clsx from "clsx";
import { LessonMode } from "../store/useLessonStore";

interface LessonHeaderProps {
  progressPercentage: number;
  hearts: number;
  heartLostTrigger?: boolean;
  isPractice?: boolean;
  mode?: LessonMode;
  timeRemaining?: number;
  strikesRemaining?: number;
  maxStrikes?: number;
  bonusTimeAdded?: number | null;
  onQuit: () => void;
}

export default function LessonHeader({
  progressPercentage,
  hearts,
  heartLostTrigger = false,
  isPractice = false,
  mode = "standard",
  timeRemaining = 90,
  strikesRemaining = 3,
  maxStrikes = 3,
  bonusTimeAdded = null,
  onQuit,
}: LessonHeaderProps) {
  const router = useRouter();
  const [showQuitModal, setShowQuitModal] = useState(false);

  const handleConfirmQuit = () => {
    setShowQuitModal(false);
    onQuit();
    router.push("/learn");
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeRemaining <= 20;

  return (
    <>
      <header
        className={clsx(
          "max-w-4xl mx-auto w-full px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between select-none transition-colors",
          mode === "legendary" ? "border-b border-purple-500/20 bg-purple-950/10 rounded-b-2xl" : ""
        )}
      >
        {/* Close ✕ button */}
        <button
          type="button"
          onClick={() => setShowQuitModal(true)}
          className="text-[#AFAFAF] dark:text-[#8598A3] hover:opacity-80 p-2 rounded-xl transition cursor-pointer shrink-0"
          title="Quit Lesson"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Progress Bar */}
        <div className="bg-[#E5E5E5] dark:bg-[#263843] rounded-full h-4 mx-3 sm:mx-8 flex-1 overflow-hidden relative shadow-inner">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-500 ease-out relative",
              mode === "legendary"
                ? "bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-400"
                : mode === "timed"
                ? "bg-gradient-to-r from-amber-400 to-[#FF9600]"
                : "bg-[#58CC02]"
            )}
            style={{ width: `${Math.max(5, Math.min(100, progressPercentage))}%` }}
          >
            {/* Glossy top stripe */}
            <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/40 rounded-full" />
          </div>
        </div>

        {/* Mode Indicators */}
        <div className="flex items-center gap-3 shrink-0">
          {/* 1. Timed Practice Mode */}
          {mode === "timed" && (
            <div className="relative flex items-center">
              <div
                className={clsx(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-mono font-extrabold text-base sm:text-lg border-2 shadow-xs transition-all",
                  isLowTime
                    ? "bg-[#FFDFE0] dark:bg-[#33181A] border-[#FF4B4B] text-[#FF4B4B] animate-pulse scale-105"
                    : "bg-[#FFF9E6] dark:bg-[#2A2315] border-[#FFC800] text-[#D97706] dark:text-[#FBBF24]"
                )}
              >
                <Timer className={clsx("w-5 h-5", isLowTime ? "text-[#FF4B4B]" : "text-[#D97706] dark:text-[#FBBF24]")} />
                <span>{formatTime(timeRemaining)}</span>
              </div>

              {/* +5s Floating Animation */}
              {bonusTimeAdded && (
                <div className="absolute -top-7 right-0 animate-bounce pointer-events-none">
                  <span className="bg-[#58CC02] text-white text-xs font-black px-2 py-0.5 rounded-full shadow-md">
                    +{bonusTimeAdded}s!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 2. Legendary Challenge Mode */}
          {mode === "legendary" && (
            <div className="flex items-center gap-1.5 font-extrabold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-3.5 py-1.5 rounded-2xl border-2 border-purple-400/40 shadow-xs">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div className="flex items-center gap-1">
                {Array.from({ length: maxStrikes }).map((_, idx) => {
                  const strikeLost = idx >= strikesRemaining;
                  return (
                    <div
                      key={idx}
                      className={clsx(
                        "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                        strikeLost
                          ? "bg-red-500/20 border-red-500 text-red-500 text-[10px]"
                          : "bg-purple-600 border-purple-400"
                      )}
                    >
                      {strikeLost && "✕"}
                    </div>
                  );
                })}
              </div>
              <span className="text-xs font-black ml-1 uppercase hidden sm:inline">
                {strikesRemaining} {strikesRemaining === 1 ? "Strike" : "Strikes"}
              </span>
            </div>
          )}

          {/* 3. Practice / Mistakes Mode */}
          {(mode === "practice" || mode === "mistakes" || isPractice) && mode !== "timed" && mode !== "legendary" && (
            <div className="flex items-center gap-1.5 font-extrabold text-[#58CC02] bg-[#D7FFB8] dark:bg-[#142B1A] px-3.5 py-1.5 rounded-2xl border border-[#58CC02]/30 shadow-xs">
              <Heart className="w-4 h-4 fill-[#58CC02] stroke-[#58CC02]" />
              <span className="text-xs font-black tracking-wider uppercase">Practice</span>
            </div>
          )}

          {/* 4. Standard Lesson Hearts */}
          {mode === "standard" && !isPractice && (
            <div
              className={clsx(
                "flex items-center gap-1.5 font-extrabold text-[#FF4B4B] transition-transform",
                heartLostTrigger ? "animate-heart-loss scale-110" : ""
              )}
            >
              <Heart
                className={clsx(
                  "w-6 h-6 fill-[#FF4B4B] stroke-[#FF4B4B] drop-shadow-sm transition-transform",
                  heartLostTrigger ? "scale-125 fill-[#EA2B2B] stroke-[#EA2B2B]" : ""
                )}
              />
              <span className="text-xl font-extrabold">{hearts}</span>
            </div>
          )}
        </div>
      </header>

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#18272F] rounded-3xl p-6 sm:p-8 max-w-sm w-full border-2 border-[#E5E5E5] dark:border-[#263843] shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FFDFE0] dark:bg-[#33181A] mx-auto flex items-center justify-center text-3xl">
              🥺
            </div>
            <h3 className="text-2xl font-black text-[#4B4B4B] dark:text-white">Quit session?</h3>
            <p className="text-sm font-bold text-[#777777] dark:text-[#8598A3]">
              {mode === "legendary"
                ? "Leaving now will cancel your Legendary Challenge."
                : mode === "timed"
                ? "Leaving now will forfeit your timed speed score."
                : "All progress in this lesson will be lost."}
            </p>
            <div className="space-y-2.5 pt-2">
              <Button3D
                variant="blue"
                fullWidth
                size="md"
                onClick={() => setShowQuitModal(false)}
              >
                Keep Going
              </Button3D>
              <Button3D
                variant="red"
                fullWidth
                size="md"
                onClick={handleConfirmQuit}
              >
                End Session
              </Button3D>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
