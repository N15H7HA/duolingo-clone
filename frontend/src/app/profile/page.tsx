"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/ui/TopBar";
import { useMe } from "@/hooks/useDuolingo";
import { Flame, Gem, Zap, Shield, Calendar, Clock } from "lucide-react";

export default function ProfilePage() {
  const { data: user } = useMe();

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 border-r-2 border-swan/40">
        <TopBar />
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-8 space-y-6 pb-24">
          {/* Profile Header */}
          <div className="flex items-center gap-6 p-6 bg-snow rounded-3xl border-2 border-swan shadow-sm">
            <div className="w-24 h-24 rounded-full bg-featherGreen/10 border-4 border-featherGreen flex items-center justify-center text-5xl">
              🦉
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-eel">{user.display_name}</h1>
              <p className="text-sm font-bold text-wolf">@{user.username}</p>
              <p className="text-xs font-bold text-wolf mt-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Timezone: {user.timezone}</span>
              </p>
            </div>
          </div>

          {/* Statistics Grid */}
          <h3 className="text-xl font-black text-eel">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-polar rounded-2xl border-2 border-swan flex items-center gap-3">
              <Flame className="w-8 h-8 text-fox fill-fox" />
              <div>
                <p className="text-xl font-black text-eel">{user.streak}</p>
                <p className="text-xs font-bold text-wolf uppercase">Day Streak</p>
              </div>
            </div>

            <div className="p-4 bg-polar rounded-2xl border-2 border-swan flex items-center gap-3">
              <Zap className="w-8 h-8 text-bee fill-bee" />
              <div>
                <p className="text-xl font-black text-eel">{user.xp_total}</p>
                <p className="text-xs font-bold text-wolf uppercase">Total XP</p>
              </div>
            </div>

            <div className="p-4 bg-polar rounded-2xl border-2 border-swan flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#CD7F32] fill-[#CD7F32]" />
              <div>
                <p className="text-xl font-black text-eel">Bronze</p>
                <p className="text-xs font-bold text-wolf uppercase">Current League</p>
              </div>
            </div>

            <div className="p-4 bg-polar rounded-2xl border-2 border-swan flex items-center gap-3">
              <Gem className="w-8 h-8 text-macaw fill-macaw" />
              <div>
                <p className="text-xl font-black text-eel">{user.gems}</p>
                <p className="text-xs font-bold text-wolf uppercase">Gems</p>
              </div>
            </div>
          </div>
        </main>
      </div>
      <RightSidebar />
    </div>
  );
}
