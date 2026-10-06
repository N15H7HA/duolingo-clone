"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/ui/TopBar";
import { useMe } from "@/hooks/useDuolingo";
import { Target, Zap, Flame, Award } from "lucide-react";

export default function QuestsPage() {
  const { data: user } = useMe();

  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 border-r-2 border-swan/40">
        <TopBar />
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-8 space-y-6 pb-24">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-eel">Daily Quests</h1>
            <p className="text-sm font-bold text-wolf">Complete quests every day to earn rewards.</p>
          </div>

          <div className="space-y-4">
            {/* Quest 1 */}
            <div className="p-5 bg-snow rounded-3xl border-2 border-swan shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-feedbackGreenBg rounded-2xl flex items-center justify-center border border-featherGreen/30">
                <Zap className="w-6 h-6 text-featherGreen fill-featherGreen" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-black text-eel text-sm">Earn {user?.daily_goal_xp || 20} XP</h4>
                  <span className="text-xs font-black text-wolf">{user?.daily_xp_today || 0} / {user?.daily_goal_xp || 20} XP</span>
                </div>
                <div className="w-full bg-swan h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-featherGreen h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, user?.goal_percentage || 0)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quest 2 */}
            <div className="p-5 bg-snow rounded-3xl border-2 border-swan shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-feedbackRedBg rounded-2xl flex items-center justify-center border border-cardinal/30">
                <Flame className="w-6 h-6 text-fox fill-fox" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-black text-eel text-sm">Maintain a 3+ Day Streak</h4>
                  <span className="text-xs font-black text-fox">{user?.streak || 0} / 3 Days</span>
                </div>
                <div className="w-full bg-swan h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-fox h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((user?.streak || 0) / 3) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <RightSidebar />
    </div>
  );
}
