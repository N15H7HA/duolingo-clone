"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/ui/TopBar";
import { useMe, useHeartRefill } from "@/hooks/useDuolingo";
import { Heart, Gem, ShieldAlert, Sparkles } from "lucide-react";
import Button3D from "@/components/ui/Button3D";

export default function ShopPage() {
  const { data: user } = useMe();
  const heartRefill = useHeartRefill();

  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 border-r-2 border-swan/40">
        <TopBar />
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-8 space-y-6 pb-24">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-eel">Shop</h1>
            <p className="text-sm font-bold text-wolf">Power-ups, heart refills, and boosters.</p>
          </div>

          <div className="space-y-4">
            {/* Heart Refill Card */}
            <div className="p-6 bg-snow rounded-3xl border-2 border-swan shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-feedbackRedBg rounded-2xl flex items-center justify-center border border-cardinal/30">
                  <Heart className="w-8 h-8 text-cardinal fill-cardinal" />
                </div>
                <div>
                  <h3 className="font-black text-eel text-lg">Heart Refill</h3>
                  <p className="text-xs font-bold text-wolf">Refill your hearts to full so you can keep practicing.</p>
                </div>
              </div>

              <Button3D
                variant="blue"
                size="sm"
                onClick={() => heartRefill.mutate()}
                disabled={!user || user.hearts >= 5 || user.gems < 350 || heartRefill.isPending}
              >
                <div className="flex items-center gap-1.5">
                  <Gem className="w-4 h-4 fill-snow" />
                  <span>350</span>
                </div>
              </Button3D>
            </div>

            {/* Streak Freeze Card */}
            <div className="p-6 bg-snow rounded-3xl border-2 border-swan shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-selectedCardBg rounded-2xl flex items-center justify-center border border-macaw/30">
                  <ShieldAlert className="w-8 h-8 text-macaw" />
                </div>
                <div>
                  <h3 className="font-black text-eel text-lg">Streak Freeze</h3>
                  <p className="text-xs font-bold text-wolf">Protects your streak for 1 day of inactivity.</p>
                </div>
              </div>

              <Button3D variant="white" size="sm" disabled>
                Equipped (2/2)
              </Button3D>
            </div>
          </div>
        </main>
      </div>
      <RightSidebar />
    </div>
  );
}
