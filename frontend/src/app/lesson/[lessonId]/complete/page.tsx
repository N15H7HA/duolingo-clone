"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { Zap, Target, Clock, Flame, Sparkles, CheckCircle, ChevronRight } from "lucide-react";
import Button3D from "@/components/ui/Button3D";

export default function LessonCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const queryClient = useQueryClient();

  const xpEarned = searchParams.get("xp") ? parseInt(searchParams.get("xp")!, 10) : 17;
  const accuracy = searchParams.get("accuracy") ? parseInt(searchParams.get("accuracy")!, 10) : 100;
  const timeSeconds = searchParams.get("time") ? parseInt(searchParams.get("time")!, 10) : 85;
  const streak = searchParams.get("streak") ? parseInt(searchParams.get("streak")!, 10) : 3;
  const title = searchParams.get("title") || "Spanish Lesson";

  // Format time as M:SS
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  // Launch 2-second confetti burst on mount
  useEffect(() => {
    // Invalidate queries so that path, user profile, and leaderboard are fresh
    queryClient.invalidateQueries({ queryKey: ["user-me"] });
    queryClient.invalidateQueries({ queryKey: ["learning-path"] });
    queryClient.invalidateQueries({ queryKey: ["league-leaderboard"] });

    const duration = 2 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#58CC02", "#1CB0F6", "#FFC800", "#FF4B4B", "#CE82FF"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#58CC02", "#1CB0F6", "#FFC800", "#FF4B4B", "#CE82FF"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [queryClient]);

  const handleContinue = () => {
    router.push("/learn");
  };

  return (
    <div className="min-h-screen bg-snow flex flex-col items-center justify-between p-6 sm:p-10 select-none">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-200">
        {/* Celebration Mascot & Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-bee/20 border-4 border-bee flex items-center justify-center text-6xl sm:text-7xl shadow-xl animate-bounce">
              🦉
            </div>
            <div className="absolute -bottom-2 -right-2 bg-featherGreen text-snow p-2 rounded-full border-4 border-snow shadow-md">
              <Sparkles className="w-6 h-6 fill-snow stroke-snow" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-bee tracking-tight">
            Lesson Complete!
          </h1>
          <p className="text-wolf font-extrabold text-sm sm:text-base">
            You practiced <span className="text-eel font-black">{title}</span>
          </p>
        </div>

        {/* 3 Three-Dimensional Stat Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full">
          {/* Card 1: TOTAL XP */}
          <div className="bg-snow rounded-3xl p-4 sm:p-5 border-2 border-b-[6px] border-bee text-center space-y-2 shadow-sm transition-transform hover:-translate-y-1">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-bee">
              Total XP
            </p>
            <div className="flex items-center justify-center gap-1">
              <Zap className="w-5 h-5 text-bee fill-bee" />
              <span className="text-2xl sm:text-3xl font-black text-bee">+{xpEarned}</span>
            </div>
          </div>

          {/* Card 2: AMAZING ACCURACY */}
          <div className="bg-snow rounded-3xl p-4 sm:p-5 border-2 border-b-[6px] border-featherGreen text-center space-y-2 shadow-sm transition-transform hover:-translate-y-1">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-featherGreen">
              Amazing
            </p>
            <div className="flex items-center justify-center gap-1">
              <Target className="w-5 h-5 text-featherGreen stroke-[3]" />
              <span className="text-2xl sm:text-3xl font-black text-featherGreen">{accuracy}%</span>
            </div>
          </div>

          {/* Card 3: COMMITTED TIME */}
          <div className="bg-snow rounded-3xl p-4 sm:p-5 border-2 border-b-[6px] border-macaw text-center space-y-2 shadow-sm transition-transform hover:-translate-y-1">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-macaw">
              Committed
            </p>
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-5 h-5 text-macaw stroke-[3]" />
              <span className="text-2xl sm:text-3xl font-black text-macaw">{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Streak Roll Callout Banner */}
        <div className="w-full bg-polar rounded-3xl border-2 border-swan p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-feedbackRedBg flex items-center justify-center border-2 border-cardinal/20">
              <Flame className="w-8 h-8 text-fox fill-fox animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-eel">You&apos;re on a roll!</h3>
              <p className="text-xs font-bold text-wolf">
                You extended your streak to <span className="text-fox font-black">{streak} days</span>
              </p>
            </div>
          </div>
          <span className="text-2xl font-black text-fox">{streak} 🔥</span>
        </div>
      </div>

      {/* Bottom Sticky Action Button */}
      <div className="w-full max-w-lg mx-auto pt-6">
        <Button3D
          variant="green"
          fullWidth
          size="lg"
          onClick={handleContinue}
        >
          Continue
        </Button3D>
      </div>
    </div>
  );
}
