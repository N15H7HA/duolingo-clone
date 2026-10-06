"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/ui/TopBar";
import { useMe } from "@/hooks/useDuolingo";
import {
  Flame,
  Zap,
  Shield,
  Trophy,
  Calendar,
  Clock,
  Award,
  BookOpen,
  Sparkles,
  Lock,
} from "lucide-react";
import clsx from "clsx";

export default function ProfilePage() {
  const { data: user, isLoading } = useMe();

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-snow">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="h-40 bg-polar rounded-3xl animate-pulse border-2 border-swan" />
        </div>
      </div>
    );
  }

  // Sample achievements
  const achievements = [
    {
      id: "wildfire",
      name: "Wildfire",
      description: "Reach a 3 day streak",
      icon: "🔥",
      current: user.streak,
      target: 3,
      isCompleted: user.streak >= 3,
    },
    {
      id: "sage",
      name: "Sage",
      description: "Earn 250 XP total",
      icon: "⚡",
      current: user.xp_total,
      target: 250,
      isCompleted: user.xp_total >= 250,
    },
    {
      id: "scholar",
      name: "Scholar",
      description: "Learn 50 new Spanish words",
      icon: "📚",
      current: 35,
      target: 50,
      isCompleted: false,
    },
    {
      id: "champion",
      name: "Champion",
      description: "Finish in the Top 3 of Bronze League",
      icon: "🏆",
      current: 1,
      target: 1,
      isCompleted: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-snow select-none">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 border-r-2 border-swan/40">
        <TopBar />
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-8 space-y-8 pb-24">
          {/* User Header Profile Card */}
          <div className="relative p-6 sm:p-8 bg-snow rounded-3xl border-2 border-swan shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-featherGreen/15 border-4 border-featherGreen flex items-center justify-center text-5xl sm:text-6xl shadow-inner shrink-0">
              🦉
            </div>

            {/* Meta Info */}
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-eel">{user.display_name}</h1>
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded-lg bg-polar border border-swan text-wolf w-fit mx-auto sm:mx-0">
                  🇪🇸 Spanish
                </span>
              </div>
              <p className="text-sm font-bold text-wolf">@{user.username}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-wolf pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined October 2026</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{user.timezone}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="space-y-3">
            <h3 className="text-xl font-black text-eel">Statistics</h3>
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
              {/* Day Streak */}
              <div className="p-4 sm:p-5 bg-snow rounded-3xl border-2 border-b-4 border-swan flex items-center gap-3.5 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-feedbackRedBg flex items-center justify-center">
                  <Flame className="w-7 h-7 text-fox fill-fox" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-eel">{user.streak}</p>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-wolf">Day Streak</p>
                </div>
              </div>

              {/* Total XP */}
              <div className="p-4 sm:p-5 bg-snow rounded-3xl border-2 border-b-4 border-swan flex items-center gap-3.5 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-bee/10 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-bee fill-bee" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-eel">{user.xp_total}</p>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-wolf">Total XP</p>
                </div>
              </div>

              {/* Current League */}
              <div className="p-4 sm:p-5 bg-snow rounded-3xl border-2 border-b-4 border-swan flex items-center gap-3.5 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#CD7F32]/10 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-[#CD7F32] fill-[#CD7F32]" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-eel">Bronze</p>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-wolf">Current League</p>
                </div>
              </div>

              {/* Top 3 Finishes */}
              <div className="p-4 sm:p-5 bg-snow rounded-3xl border-2 border-b-4 border-swan flex items-center gap-3.5 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-macaw/10 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-macaw fill-macaw" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-eel">1</p>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-wolf">Top 3 Finishes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-eel">Achievements</h3>
              <span className="text-xs font-black uppercase text-macaw">View All</span>
            </div>

            <div className="space-y-3">
              {achievements.map((ach) => {
                const progressPct = Math.min(100, Math.round((ach.current / ach.target) * 100));

                return (
                  <div
                    key={ach.id}
                    className="p-4 sm:p-5 bg-snow rounded-3xl border-2 border-swan shadow-sm flex items-center gap-4"
                  >
                    <div
                      className={clsx(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 shadow-xs",
                        ach.isCompleted
                          ? "bg-bee/15 border-bee text-bee"
                          : "bg-polar border-swan text-wolf opacity-70"
                      )}
                    >
                      {ach.icon}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-black text-sm sm:text-base text-eel">{ach.name}</h4>
                        <span className="text-xs font-extrabold text-wolf">
                          {ach.current} / {ach.target}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-wolf">{ach.description}</p>
                      <div className="w-full bg-swan h-2.5 rounded-full overflow-hidden mt-2">
                        <div
                          className={clsx(
                            "h-full rounded-full transition-all duration-500",
                            ach.isCompleted ? "bg-bee" : "bg-macaw"
                          )}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
      <RightSidebar />
    </div>
  );
}
