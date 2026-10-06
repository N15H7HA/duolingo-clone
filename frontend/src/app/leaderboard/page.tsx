"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/ui/TopBar";
import { useLeaderboard } from "@/hooks/useDuolingo";
import { Shield, Trophy, ChevronUp, ChevronDown, Clock, Sparkles } from "lucide-react";
import clsx from "clsx";

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useLeaderboard();

  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 border-r-2 border-swan/40">
        <TopBar />
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-8 space-y-6 pb-24 select-none">
          {/* Bronze League Tournament Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#CD7F32] via-[#B87333] to-[#8B4513] p-6 text-snow shadow-md border-b-4 border-black/20">
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-3xl shadow-inner">
                  🛡️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                      {leaderboard?.league_name || "Bronze"} League
                    </h1>
                    <span className="text-xs font-black uppercase px-2 py-0.5 rounded-lg bg-white/20">
                      Tier {leaderboard?.league_tier || 1}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-snow/90 mt-0.5">
                    Top 10 advance to Silver League!
                  </p>
                </div>
              </div>

              {/* Tournament Countdown */}
              <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur px-3.5 py-2 rounded-2xl text-xs font-black border border-white/10">
                <Clock className="w-4 h-4 text-bee" />
                <span>3d 14h left</span>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-14 bg-polar rounded-2xl animate-pulse border border-swan" />
              ))}
            </div>
          ) : (
            <div className="bg-snow rounded-3xl border-2 border-swan shadow-sm overflow-hidden divide-y divide-swan">
              {leaderboard?.entries.map((entry) => {
                const rank = entry.rank;
                const isPromotionZone = rank <= 10;
                const isDemotionZone = rank >= 26;
                const isCurrent = entry.is_current_user;

                return (
                  <div
                    key={entry.user_id}
                    className={clsx(
                      "flex items-center justify-between p-4 sm:px-6 transition-colors duration-100",
                      isCurrent
                        ? "bg-selectedCardBg border-2 border-macaw text-macaw font-black shadow-inner"
                        : "hover:bg-polar text-eel font-extrabold"
                    )}
                  >
                    {/* Rank & User Details */}
                    <div className="flex items-center gap-3.5 sm:gap-5">
                      {/* Rank Indicator */}
                      <div className="flex items-center gap-1 w-9 justify-center">
                        <span
                          className={clsx(
                            "text-sm sm:text-base font-black",
                            rank === 1
                              ? "text-bee"
                              : rank === 2
                              ? "text-[#AFAFAF]"
                              : rank === 3
                              ? "text-[#CD7F32]"
                              : isPromotionZone
                              ? "text-featherGreen"
                              : isDemotionZone
                              ? "text-cardinal"
                              : "text-wolf"
                          )}
                        >
                          {rank}
                        </span>

                        {/* Trend arrows */}
                        {isPromotionZone && (
                          <ChevronUp className="w-3.5 h-3.5 text-featherGreen stroke-[3]" />
                        )}
                        {isDemotionZone && (
                          <ChevronDown className="w-3.5 h-3.5 text-cardinal stroke-[3]" />
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-polar border-2 border-swan flex items-center justify-center text-xl shadow-xs">
                        {isCurrent ? "🦉" : rank % 2 === 0 ? "👨‍🎓" : "👩‍🎓"}
                      </div>

                      {/* Name & Handle */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm sm:text-base font-black leading-tight">
                            {entry.display_name}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-macaw text-snow">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-wolf font-bold">@{entry.username}</p>
                      </div>
                    </div>

                    {/* Weekly XP Total */}
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black">{entry.weekly_xp}</span>
                      <span className="text-xs text-wolf font-bold ml-1">XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* League Rules Info Card */}
          <div className="p-4 bg-polar rounded-2xl border-2 border-swan text-xs font-bold text-wolf flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-featherGreen" />
              <span>Ranks 1–10: Advance to Silver</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cardinal" />
              <span>Ranks 26–30: Demotion Zone</span>
            </div>
          </div>
        </main>
      </div>
      <RightSidebar />
    </div>
  );
}
