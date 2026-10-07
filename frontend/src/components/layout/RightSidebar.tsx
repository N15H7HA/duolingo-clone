"use client";

import React from "react";
import Link from "next/link";
import { Zap, Shield, Sparkles } from "lucide-react";
import { useMe, useLeaderboard } from "@/hooks/useDuolingo";
import Button3D from "../ui/Button3D";

export default function RightSidebar() {
  const { data: user } = useMe();
  const { data: leaderboard } = useLeaderboard();

  return (
    <aside className="hidden lg:flex flex-col w-[368px] p-6 gap-6 select-none shrink-0 border-l border-[#E5E5E5] dark:border-[#263843]">
      {/* 1. Emerald League Card */}
      <div className="bg-white dark:bg-[#18272F] rounded-3xl border-2 border-[#E5E5E5] dark:border-[#263843] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D7FFB8] dark:bg-[#142B1A] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#58CC02] fill-[#58CC02]" />
            </div>
            <h4 className="font-extrabold text-base text-[#4B4B4B] dark:text-white">
              {leaderboard?.league_name || "Emerald"} League
            </h4>
          </div>
          <Link
            href="/leaderboard"
            className="text-xs font-extrabold uppercase text-[#1CB0F6] hover:underline"
          >
            View
          </Link>
        </div>

        {leaderboard && (
          <div className="space-y-2 pt-1">
            {leaderboard.entries.slice(0, 4).map((entry) => (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-extrabold transition ${
                  entry.is_current_user
                    ? "bg-[#DDF4FF] dark:bg-[#142B36] text-[#1CB0F6] border border-[#1CB0F6]/30"
                    : "text-[#4B4B4B] dark:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#1F333D]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 text-center text-[#777777] dark:text-[#8598A3] font-bold">
                    {entry.rank}
                  </span>
                  <span className="text-base">👤</span>
                  <span className="truncate max-w-[130px]">{entry.display_name}</span>
                </div>
                <span className="text-[#777777] dark:text-[#8598A3] font-bold">
                  {entry.weekly_xp} XP
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Daily Quests Card with XP Progress Bar */}
      <div className="bg-white dark:bg-[#18272F] rounded-3xl border-2 border-[#E5E5E5] dark:border-[#263843] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-base text-[#4B4B4B] dark:text-white tracking-wide">
            Daily Quests
          </h4>
          <Link
            href="/quests"
            className="text-xs font-extrabold uppercase text-[#1CB0F6] hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Radial Progress / Icon */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-[#E5E5E5] dark:text-[#263843]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#FF9600] transition-all duration-500"
                strokeDasharray={`${Math.min(100, user?.goal_percentage || 0)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Zap className="absolute w-6 h-6 fill-[#FF9600] stroke-[#FF9600]" />
          </div>

          {/* Goal Details */}
          <div className="flex-1">
            <p className="text-xs font-extrabold text-[#777777] dark:text-[#8598A3] uppercase">
              Earn {user?.daily_goal_xp || 10} XP
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-[#4B4B4B] dark:text-white">
                {user?.daily_xp_today || 0}
              </span>
              <span className="text-xs font-extrabold text-[#777777] dark:text-[#8598A3]">
                / {user?.daily_goal_xp || 10} XP
              </span>
            </div>
            <div className="w-full bg-[#E5E5E5] dark:bg-[#263843] h-2.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#FF9600] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, user?.goal_percentage || 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Super Duolingo Promo Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1CB0F6] via-[#1899D6] to-[#042C60] p-5 text-white shadow-md border-2 border-[#1899D6]">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFC800] fill-[#FFC800] animate-bounce" />
            <h4 className="font-black text-lg tracking-wide uppercase">Super Duolingo</h4>
          </div>
          <p className="text-xs font-bold leading-relaxed text-white/90">
            Unlimited Hearts, personalized practice, and no interruptions.
          </p>
          <Link href="/shop" className="block pt-1">
            <Button3D variant="white" size="sm" fullWidth className="text-[#1CB0F6] font-black">
              Start 2-Week Free Trial
            </Button3D>
          </Link>
        </div>
      </div>
    </aside>
  );
}
