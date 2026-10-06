"use client";

import React from "react";
import Link from "next/link";
import { Zap, Trophy, Shield, Sparkles, Heart } from "lucide-react";
import { useMe, useLeaderboard } from "@/hooks/useDuolingo";
import Button3D from "../ui/Button3D";

export default function RightSidebar() {
  const { data: user } = useMe();
  const { data: leaderboard } = useLeaderboard();

  return (
    <aside className="hidden xl:flex flex-col w-80 lg:w-96 p-6 gap-6 select-none">
      {/* 1. Daily Goal / Quest Card */}
      {user && (
        <div className="bg-snow rounded-3xl border-2 border-swan p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-base text-eel tracking-wide">Daily Quest</h4>
            <Link href="/quests" className="text-xs font-extrabold uppercase text-macaw hover:underline">
              View All
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Radial Progress Ring */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-swan"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-fox transition-all duration-500"
                  strokeDasharray={`${Math.min(100, user.goal_percentage)}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <Zap className="absolute w-6 h-6 fill-fox stroke-fox" />
            </div>

            {/* Goal Details */}
            <div className="flex-1">
              <p className="text-xs font-extrabold text-wolf uppercase">Earn {user.daily_goal_xp} XP</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-eel">{user.daily_xp_today}</span>
                <span className="text-xs font-extrabold text-wolf">/ {user.daily_goal_xp} XP</span>
              </div>
              <div className="w-full bg-swan h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-fox h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, user.goal_percentage)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Mini Leaderboard Snippet */}
      {leaderboard && (
        <div className="bg-snow rounded-3xl border-2 border-swan p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-bee fill-bee" />
              <h4 className="font-extrabold text-base text-eel">{leaderboard.league_name} League</h4>
            </div>
            <Link href="/leaderboard" className="text-xs font-extrabold uppercase text-macaw hover:underline">
              View
            </Link>
          </div>

          <div className="space-y-2 pt-1">
            {leaderboard.entries.slice(0, 4).map((entry) => (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-extrabold ${
                  entry.is_current_user ? "bg-selectedCardBg text-macaw border border-macaw/20" : "text-eel"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 text-center text-wolf font-bold">{entry.rank}</span>
                  <span className="text-sm">👤</span>
                  <span className="truncate max-w-[120px]">{entry.display_name}</span>
                </div>
                <span className="text-wolf font-bold">{entry.weekly_xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Super Duolingo Promo Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1CB0F6] via-[#1899D6] to-[#042C60] p-5 text-snow shadow-md border-2 border-macawShadow">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-bee fill-bee animate-bounce" />
            <h4 className="font-black text-lg tracking-wide uppercase">Super Duolingo</h4>
          </div>
          <p className="text-xs font-bold leading-relaxed text-snow/90">
            Unlimited Hearts, personalized practice, and no interruptions.
          </p>
          <Link href="/shop" className="block pt-1">
            <Button3D variant="white" size="sm" fullWidth className="text-macaw font-black">
              Start 2-Week Free Trial
            </Button3D>
          </Link>
        </div>
      </div>
    </aside>
  );
}
