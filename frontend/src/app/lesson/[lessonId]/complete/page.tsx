"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { Zap, Target, Clock, Flame, Sparkles, Crown, Timer } from "lucide-react";
import Button3D from "@/components/ui/Button3D";
import clsx from "clsx";

export default function LessonCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const targetXp = searchParams.get("xp") ? parseInt(searchParams.get("xp")!, 10) : 15;
  const targetAccuracy = searchParams.get("accuracy") ? parseInt(searchParams.get("accuracy")!, 10) : 100;
  const timeSeconds = searchParams.get("time") ? parseInt(searchParams.get("time")!, 10) : 60;
  const streak = searchParams.get("streak") ? parseInt(searchParams.get("streak")!, 10) : 3;
  const title = searchParams.get("title") || "Spanish Lesson";
  const mode = searchParams.get("mode") || "standard";
  const isLegendary = searchParams.get("legendary") === "true" || mode === "legendary";
  const isTimed = mode === "timed";

  // Animated count-up states
  const [displayedXp, setDisplayedXp] = useState(0);
  const [displayedAccuracy, setDisplayedAccuracy] = useState(0);

  // Format time as M:SS
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  // Multi-burst celebration confetti + Animated numbers
  useEffect(() => {
    // 1. Invalidate queries so that path, user profile, and leaderboard reflect fresh state
    queryClient.invalidateQueries({ queryKey: ["user-me"] });
    queryClient.invalidateQueries({ queryKey: ["learning-path"] });
    queryClient.invalidateQueries({ queryKey: ["league-leaderboard"] });
    queryClient.invalidateQueries({ queryKey: ["practice-summary"] });

    // Confetti palette
    const confettiColors = isLegendary
      ? ["#8B5CF6", "#7C3AED", "#FFC800", "#FBBF24", "#C084FC", "#F59E0B"]
      : ["#58CC02", "#1CB0F6", "#FFC800", "#FF4B4B", "#CE82FF"];

    // 2. Center firework burst immediately
    confetti({
      particleCount: isLegendary ? 120 : 80,
      spread: 75,
      origin: { y: 0.6 },
      colors: confettiColors,
    });

    // 3. Side cannons for 2.5 seconds
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: isLegendary ? 6 : 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: confettiColors,
      });
      confetti({
        particleCount: isLegendary ? 6 : 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: confettiColors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // 4. Smooth animated number count-ups
    const xpSteps = 20;
    const xpInterval = 50;
    let currentXpStep = 0;

    const xpTimer = setInterval(() => {
      currentXpStep++;
      const current = Math.min(targetXp, Math.round((currentXpStep / xpSteps) * targetXp));
      setDisplayedXp(current);
      if (currentXpStep >= xpSteps) {
        clearInterval(xpTimer);
      }
    }, xpInterval);

    const accSteps = 20;
    const accInterval = 50;
    let currentAccStep = 0;

    const accTimer = setInterval(() => {
      currentAccStep++;
      const current = Math.min(targetAccuracy, Math.round((currentAccStep / accSteps) * targetAccuracy));
      setDisplayedAccuracy(current);
      if (currentAccStep >= accSteps) {
        clearInterval(accTimer);
      }
    }, accInterval);

    return () => {
      clearInterval(xpTimer);
      clearInterval(accTimer);
    };
  }, [queryClient, targetXp, targetAccuracy, isLegendary]);

  const handleContinue = () => {
    router.push("/learn");
  };

  return (
    <div
      className={clsx(
        "min-h-screen flex flex-col items-center justify-between p-6 sm:p-10 select-none transition-colors",
        isLegendary
          ? "bg-gradient-to-b from-purple-950/10 via-purple-900/5 to-snow dark:from-purple-950/30 dark:to-[#13111C]"
          : "bg-snow"
      )}
    >
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-200">
        {/* Celebration Mascot & Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div
              className={clsx(
                "w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 flex items-center justify-center text-6xl sm:text-7xl shadow-xl animate-bounce",
                isLegendary
                  ? "bg-purple-500/20 border-purple-500 ring-8 ring-amber-400/30"
                  : isTimed
                  ? "bg-amber-500/20 border-amber-500"
                  : "bg-bee/20 border-bee"
              )}
            >
              {isLegendary ? "👑" : isTimed ? "⏱️" : "🦉"}
            </div>
            <div
              className={clsx(
                "absolute -bottom-2 -right-2 p-2 rounded-full border-4 border-snow shadow-md",
                isLegendary ? "bg-purple-600 text-amber-300" : "bg-featherGreen text-snow"
              )}
            >
              <Sparkles className="w-6 h-6 fill-current stroke-current" />
            </div>
          </div>

          <h1
            className={clsx(
              "text-3xl sm:text-4xl font-black tracking-tight",
              isLegendary
                ? "text-purple-600 dark:text-purple-400"
                : isTimed
                ? "text-amber-500 dark:text-amber-400"
                : "text-bee"
            )}
          >
            {isLegendary
              ? "Legendary Trophy Unlocked!"
              : isTimed
              ? "Speed Practice Complete!"
              : "Lesson Complete!"}
          </h1>
          <p className="text-wolf font-extrabold text-sm sm:text-base">
            {isLegendary
              ? `You mastered ${title} at the Legendary level!`
              : isTimed
              ? `You completed rapid-fire questions under pressure!`
              : `You mastered ${title}`}
          </p>
        </div>

        {/* 3 Three-Dimensional Stat Cards with Animated Count-Ups */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full">
          {/* Card 1: TOTAL XP */}
          <div
            className={clsx(
              "bg-snow rounded-3xl p-4 sm:p-5 border-2 border-b-[6px] text-center space-y-2 shadow-sm transition-transform hover:-translate-y-1",
              isLegendary
                ? "border-purple-500 text-purple-600 dark:text-purple-400"
                : "border-bee text-bee"
            )}
          >
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider">
              Total XP
            </p>
            <div className="flex items-center justify-center gap-1">
              <Zap className="w-5 h-5 fill-current" />
              <span className="text-2xl sm:text-3xl font-black">+{displayedXp}</span>
            </div>
          </div>

          {/* Card 2: AMAZING ACCURACY */}
          <div className="bg-snow rounded-3xl p-4 sm:p-5 border-2 border-b-[6px] border-featherGreen text-center space-y-2 shadow-sm transition-transform hover:-translate-y-1">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-featherGreen">
              Accuracy
            </p>
            <div className="flex items-center justify-center gap-1">
              <Target className="w-5 h-5 text-featherGreen stroke-[3]" />
              <span className="text-2xl sm:text-3xl font-black text-featherGreen">
                {displayedAccuracy}%
              </span>
            </div>
          </div>

          {/* Card 3: COMMITTED TIME */}
          <div className="bg-snow rounded-3xl p-4 sm:p-5 border-2 border-b-[6px] border-macaw text-center space-y-2 shadow-sm transition-transform hover:-translate-y-1">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-macaw">
              Speed
            </p>
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-5 h-5 text-macaw stroke-[3]" />
              <span className="text-2xl sm:text-3xl font-black text-macaw">{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Streak / Legendary Roll Callout Banner */}
        <div className="w-full bg-polar rounded-3xl border-2 border-swan p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className={clsx(
                "w-14 h-14 rounded-2xl flex items-center justify-center border-2",
                isLegendary
                  ? "bg-purple-100 border-purple-300 text-2xl"
                  : "bg-feedbackRedBg border-cardinal/20"
              )}
            >
              {isLegendary ? (
                <Crown className="w-8 h-8 text-amber-500 fill-amber-500 animate-pulse" />
              ) : (
                <Flame className="w-8 h-8 text-fox fill-fox animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-eel">
                {isLegendary ? "Legendary Status Achieved" : "You're on a roll!"}
              </h3>
              <p className="text-xs font-bold text-wolf">
                {isLegendary
                  ? "Your skill node now gleams in deep purple & radiant gold."
                  : `You extended your streak to ${streak} days`}
              </p>
            </div>
          </div>
          <span className="text-2xl font-black text-fox">{streak} 🔥</span>
        </div>
      </div>

      {/* Bottom Sticky Action Button */}
      <div className="w-full max-w-lg mx-auto pt-6">
        <Button3D
          variant={isLegendary ? "purple" : "green"}
          fullWidth
          size="lg"
          onClick={handleContinue}
          className={clsx(isLegendary ? "shadow-lg shadow-purple-500/25" : "")}
        >
          Continue
        </Button3D>
      </div>
    </div>
  );
}
