"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/ui/TopBar";
import Button3D from "@/components/ui/Button3D";
import { Dumbbell, Heart, Zap, Sparkles, XCircle, Timer, Flame } from "lucide-react";
import Link from "next/link";
import { useMe, usePracticeSummary } from "@/hooks/useDuolingo";
import clsx from "clsx";

export default function PracticePage() {
  const { data: user } = useMe();
  const { data: summary, isLoading: isSummaryLoading } = usePracticeSummary();

  const mistakesCount = summary?.mistakes_count ?? 0;
  const hasMistakes = mistakesCount > 0;

  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 border-r-2 border-swan/40">
        <TopBar />
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-8 space-y-8 pb-24 select-none">
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-[#1CB0F6] via-[#1899D6] to-[#042C60] p-6 text-white shadow-md border-b-4 border-black/15">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
                <Dumbbell className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Practice Hub</h1>
                <p className="text-xs sm:text-sm font-bold text-white/90">
                  Target your mistakes, race the clock in speed challenges, and earn bonus XP with zero heart risk.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Your Collections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-eel">Today&apos;s Review & Challenges</h2>
              <span className="text-xs font-black uppercase text-[#1CB0F6] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                No Heart Loss
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Timed Speed Practice Card */}
              <div className="bg-gradient-to-b from-[#FFF9E6] to-white dark:from-[#2A2315] dark:to-[#18272F] rounded-3xl border-2 border-[#FFC800]/50 dark:border-[#FFC800]/30 border-b-4 p-5 space-y-4 shadow-sm flex flex-col justify-between sm:col-span-2 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFC800] text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                      <Timer className="w-8 h-8 stroke-[2.5] animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-[#4B4B4B] dark:text-white">
                          Timed Practice / Speed Challenge
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#FF9600] text-white px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#777777] dark:text-[#8598A3] mt-1">
                        12 rapid-fire questions in 90 seconds. Earn +5s for every correct answer and scale up to +20 XP!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-[#FFC800]/20 text-[#D97706] dark:text-[#FBBF24] border border-[#FFC800]/40 whitespace-nowrap">
                      ⏱ 90s + ⚡️ XP
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/lesson/practice?type=timed" className="block">
                    <Button3D
                      variant="gold"
                      fullWidth
                      size="md"
                      className="shadow-md shadow-amber-500/20 font-black text-sm"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Flame className="w-5 h-5 fill-white" />
                        START SPEED CHALLENGE (+20 XP)
                      </span>
                    </Button3D>
                  </Link>
                </div>
              </div>

              {/* 2. Mistakes Review Card */}
              <div className="bg-white dark:bg-[#18272F] rounded-3xl border-2 border-[#E5E5E5] dark:border-[#263843] border-b-4 p-5 space-y-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFDFE0] dark:bg-[#33181A] flex items-center justify-center text-2xl">
                      <XCircle className="w-6 h-6 text-[#FF4B4B] stroke-[2.5]" />
                    </div>

                    {/* Mistakes Badge */}
                    <span
                      className={clsx(
                        "text-xs font-black px-3 py-1 rounded-full border",
                        hasMistakes
                          ? "bg-[#FFDFE0] dark:bg-[#33181A] border-[#FF4B4B]/30 text-[#FF4B4B]"
                          : "bg-[#D7FFB8] dark:bg-[#142B1A] border-[#58CC02]/30 text-[#58CC02]"
                      )}
                    >
                      {isSummaryLoading
                        ? "Loading..."
                        : hasMistakes
                        ? `${mistakesCount} ${mistakesCount === 1 ? "Mistake" : "Mistakes"}`
                        : "All clear! 🎉"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-[#4B4B4B] dark:text-white">
                      Mistakes Review
                    </h3>
                    <p className="text-xs font-bold text-[#777777] dark:text-[#8598A3] mt-0.5">
                      {hasMistakes
                        ? "Review the specific questions you previously answered incorrectly."
                        : "No active mistakes! Practice recommended review questions to stay sharp."}
                    </p>
                  </div>
                </div>

                <Link href="/lesson/practice?type=mistakes" className="block pt-2">
                  <Button3D variant={hasMistakes ? "red" : "blue"} fullWidth size="md">
                    {hasMistakes ? `Review ${mistakesCount} Mistakes` : "Practice Review"}
                  </Button3D>
                </Link>
              </div>

              {/* 3. Heart Practice Card */}
              <div className="bg-white dark:bg-[#18272F] rounded-3xl border-2 border-[#E5E5E5] dark:border-[#263843] border-b-4 p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#D7FFB8] dark:bg-[#142B1A] flex items-center justify-center text-2xl">
                      <Heart className="w-6 h-6 fill-[#58CC02] stroke-[#58CC02]" />
                    </div>

                    <span className="text-xs font-black px-3 py-1 rounded-full bg-[#D7FFB8] dark:bg-[#142B1A] border border-[#58CC02]/30 text-[#58CC02]">
                      +1 Heart (+5 XP)
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-[#4B4B4B] dark:text-white">
                      Practice for Hearts
                    </h3>
                    <p className="text-xs font-bold text-[#777777] dark:text-[#8598A3] mt-0.5">
                      Complete a 5-exercise practice session to earn +1 heart and maintain your streak.
                    </p>
                  </div>
                </div>

                <Link href="/lesson/practice" className="block pt-2">
                  <Button3D variant="green" fullWidth size="md">
                    Practice (+1 ❤️)
                  </Button3D>
                </Link>
              </div>
            </div>
          </div>

          {/* Section: Spaced Repetition Engine */}
          <div className="p-6 rounded-3xl bg-[#F7F7F7] dark:bg-[#18272F] border-2 border-[#E5E5E5] dark:border-[#263843] space-y-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#FFC800] fill-[#FFC800]" />
              <h3 className="text-base font-black text-[#4B4B4B] dark:text-white">
                Spaced Repetition & Speed Mechanics
              </h3>
            </div>
            <p className="text-xs font-bold text-[#777777] dark:text-[#8598A3] leading-relaxed">
              Timed Speed Practice helps cement quick recall under pressure without risk to your persistent hearts. For every correct answer solved during the timed countdown, +5 bonus seconds are immediately added back to your clock!
            </p>
          </div>
        </main>
      </div>
      <RightSidebar />
    </div>
  );
}
