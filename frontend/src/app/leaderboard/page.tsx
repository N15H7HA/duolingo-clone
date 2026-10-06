"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/ui/TopBar";
import { useLeaderboard } from "@/hooks/useDuolingo";
import { Shield, Trophy, Medal } from "lucide-react";

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useLeaderboard();

  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 border-r-2 border-swan/40">
        <TopBar />
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-8 space-y-6 pb-24">
          {/* Header Banner */}
          <div className="text-center space-y-2 py-4">
            <div className="w-20 h-20 bg-bee/10 rounded-full flex items-center justify-center mx-auto border-2 border-bee/30 shadow-sm">
              <Trophy className="w-10 h-10 text-bee fill-bee" />
            </div>
            <h1 className="text-3xl font-black text-eel">
              {leaderboard?.league_name || "Bronze"} League
            </h1>
            <p className="text-sm font-bold text-wolf max-w-md mx-auto">
              Top 10 advance to the next league! Complete lessons to earn XP.
            </p>
          </div>

          {/* Leaderboard Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-14 bg-polar rounded-2xl animate-pulse border border-swan" />
              ))}
            </div>
          ) : (
            <div className="bg-snow rounded-3xl border-2 border-swan shadow-sm divide-y divide-swan overflow-hidden">
              {leaderboard?.entries.map((entry) => {
                const isTop3 = entry.rank <= 3;
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between p-4 transition ${
                      entry.is_current_user
                        ? "bg-selectedCardBg text-macaw font-black"
                        : "hover:bg-polar text-eel font-extrabold"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-7 text-center text-sm font-black ${
                          entry.rank === 1
                            ? "text-[#E5B200]"
                            : entry.rank === 2
                            ? "text-[#AFAFAF]"
                            : entry.rank === 3
                            ? "text-[#CD7F32]"
                            : "text-wolf"
                        }`}
                      >
                        {entry.rank}
                      </span>
                      <span className="text-2xl">👤</span>
                      <div>
                        <p className="text-sm font-black leading-tight">{entry.display_name}</p>
                        <p className="text-xs text-wolf font-bold">@{entry.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-eel">{entry.weekly_xp}</span>
                      <span className="text-xs text-wolf font-bold ml-1">XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <RightSidebar />
    </div>
  );
}
