"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/ui/TopBar";
import Button3D from "@/components/ui/Button3D";
import { Dumbbell, Heart, Zap, Sparkles, XCircle, BookOpen, CheckCircle2 } from "lucide-react";
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
                  Target your mistakes, earn hearts back, and reinforce vocabulary without penalty.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Your Collections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-eel">Your Collections</h2>
              <span className="text-xs font-black uppercase text-[#1CB0F6]">
                No Heart Loss
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Mistakes Review Card */}
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

              {/* 2. Heart Practice Card */}
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

          {/* Section: Fluency Booster */}
          <div className="p-6 rounded-3xl bg-[#F7F7F7] dark:bg-[#18272F] border-2 border-[#E5E5E5] dark:border-[#263843] space-y-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#FFC800] fill-[#FFC800]" />
              <h3 className="text-base font-black text-[#4B4B4B] dark:text-white">
                Spaced Repetition Engine
              </h3>
            </div>
            <p className="text-xs font-bold text-[#777777] dark:text-[#8598A3] leading-relaxed">
              Every error you make during lessons is automatically indexed in your personalized mistakes queue. Reviewing mistakes clears them from your memory decay backlog without risking your daily hearts.
            </p>
          </div>
        </main>
      </div>
      <RightSidebar />
    </div>
  );
}
