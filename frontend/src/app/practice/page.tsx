"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/ui/TopBar";
import Button3D from "@/components/ui/Button3D";
import { Dumbbell, Heart, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMe } from "@/hooks/useDuolingo";

export default function PracticePage() {
  const { data: user } = useMe();

  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 border-r-2 border-swan/40">
        <TopBar />
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-8 space-y-6 pb-24 select-none">
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-[#1CB0F6] to-[#1899D6] p-6 text-white shadow-md border-b-4 border-black/15">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-inner">
                <Dumbbell className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Practice Hub</h1>
                <p className="text-xs sm:text-sm font-bold text-white/90 mt-0.5">
                  Review mistakes, earn hearts back, and boost your fluency.
                </p>
              </div>
            </div>
          </div>

          {/* Practice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Heart Practice */}
            <div className="bg-white dark:bg-[#18272F] rounded-3xl border-2 border-[#E5E5E5] dark:border-[#263843] border-b-4 p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#FFDFE0] dark:bg-[#33181A] flex items-center justify-center text-2xl">
                  <Heart className="w-6 h-6 fill-[#FF4B4B] stroke-[#FF4B4B]" />
                </div>
                <h3 className="text-lg font-black text-[#4B4B4B] dark:text-white">
                  Practice for Hearts
                </h3>
                <p className="text-xs font-bold text-[#777777] dark:text-[#8598A3]">
                  Earn +1 heart and +5 XP for each completed practice session.
                </p>
              </div>
              <Link href="/lesson/1" className="block">
                <Button3D variant="green" fullWidth size="md">
                  Practice (+1 ❤️)
                </Button3D>
              </Link>
            </div>

            {/* Timed Mistake Review */}
            <div className="bg-white dark:bg-[#18272F] rounded-3xl border-2 border-[#E5E5E5] dark:border-[#263843] border-b-4 p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#DDF4FF] dark:bg-[#142B36] flex items-center justify-center text-2xl">
                  <Zap className="w-6 h-6 fill-[#1CB0F6] stroke-[#1CB0F6]" />
                </div>
                <h3 className="text-lg font-black text-[#4B4B4B] dark:text-white">
                  Targeted Weak Words
                </h3>
                <p className="text-xs font-bold text-[#777777] dark:text-[#8598A3]">
                  Strengthen previous vocabulary and improve your memory decay curve.
                </p>
              </div>
              <Link href="/lesson/2" className="block">
                <Button3D variant="blue" fullWidth size="md">
                  Review Words
                </Button3D>
              </Link>
            </div>
          </div>
        </main>
      </div>
      <RightSidebar />
    </div>
  );
}
