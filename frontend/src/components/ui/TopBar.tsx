"use client";

import React, { useState } from "react";
import { Flame, Gem, Heart, Sparkles } from "lucide-react";
import { useMe, useHeartRefill } from "@/hooks/useDuolingo";
import Button3D from "./Button3D";

export default function TopBar() {
  const { data: user } = useMe();
  const heartRefill = useHeartRefill();
  const [showHeartModal, setShowHeartModal] = useState(false);

  if (!user) {
    return (
      <header className="sticky top-0 z-30 bg-snow/90 backdrop-blur border-b border-swan px-4 py-3 flex items-center justify-between">
        <div className="h-6 w-24 bg-swan rounded animate-pulse" />
        <div className="flex gap-4">
          <div className="h-6 w-16 bg-swan rounded animate-pulse" />
          <div className="h-6 w-16 bg-swan rounded animate-pulse" />
          <div className="h-6 w-16 bg-swan rounded animate-pulse" />
        </div>
      </header>
    );
  }

  const handleRefill = () => {
    heartRefill.mutate(undefined, {
      onSuccess: () => setShowHeartModal(false),
    });
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-snow/95 backdrop-blur-md border-b border-swan px-4 md:px-8 py-3 flex items-center justify-between transition-all">
        {/* Course Flag / Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-polar cursor-pointer border border-transparent hover:border-swan transition-all">
          <span className="text-2xl drop-shadow-sm">🇪🇸</span>
          <span className="hidden sm:inline font-extrabold text-sm uppercase text-eel tracking-wider">
            Spanish
          </span>
        </div>

        {/* Gamification Stats */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Streak */}
          <div className="flex items-center gap-1.5 font-extrabold text-fox hover:bg-polar px-2.5 py-1 rounded-xl transition cursor-default">
            <Flame className="w-6 h-6 fill-fox stroke-fox drop-shadow-sm" />
            <span className="text-base font-extrabold">{user.streak}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 font-extrabold text-macaw hover:bg-polar px-2.5 py-1 rounded-xl transition cursor-default">
            <Gem className="w-5 h-5 fill-macaw stroke-macaw drop-shadow-sm" />
            <span className="text-base font-extrabold">{user.gems}</span>
          </div>

          {/* Hearts */}
          <button
            onClick={() => setShowHeartModal(true)}
            className="flex items-center gap-1.5 font-extrabold text-cardinal hover:bg-polar px-2.5 py-1 rounded-xl transition cursor-pointer border border-transparent hover:border-swan"
            title="Click to refill hearts"
          >
            <Heart className="w-5 h-5 fill-cardinal stroke-cardinal drop-shadow-sm animate-pulse" />
            <span className="text-base font-extrabold">{user.hearts}</span>
          </button>
        </div>
      </header>

      {/* Heart Refill Modal */}
      {showHeartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-eel/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-snow rounded-3xl p-6 max-w-md w-full border-2 border-swan shadow-2xl relative">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-feedbackRedBg flex items-center justify-center mx-auto mb-4 border border-cardinal/20">
                <Heart className="w-10 h-10 fill-cardinal stroke-cardinal" />
              </div>
              <h3 className="text-2xl font-extrabold text-eel mb-2">Hearts & Refill</h3>
              <p className="text-wolf text-sm font-bold mb-4">
                You have <span className="text-cardinal font-extrabold">{user.hearts} of 5 hearts</span>.
                {user.hearts < 5 ? (
                  <>
                    <br />
                    Next heart regenerates in:{" "}
                    <span className="text-macaw font-extrabold">
                      {Math.ceil(user.next_heart_in_seconds / 60)} mins
                    </span>
                  </>
                ) : (
                  " Your hearts are full!"
                )}
              </p>

              {user.hearts < 5 && (
                <div className="p-4 bg-polar rounded-2xl border border-swan mb-4 flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-extrabold text-eel text-sm">Full Refill</p>
                    <p className="text-wolf text-xs font-semibold">Refill all 5 hearts instantly</p>
                  </div>
                  <div className="flex items-center gap-1 text-macaw font-extrabold text-sm">
                    <Gem className="w-4 h-4 fill-macaw" />
                    <span>350</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                {user.hearts < 5 && (
                  <Button3D
                    variant="blue"
                    fullWidth
                    onClick={handleRefill}
                    disabled={user.gems < 350 || heartRefill.isPending}
                  >
                    {heartRefill.isPending ? "Refilling..." : user.gems < 350 ? "Not Enough Gems" : "Refill for 350 Gems"}
                  </Button3D>
                )}
                <Button3D
                  variant="white"
                  fullWidth
                  onClick={() => setShowHeartModal(false)}
                >
                  Close
                </Button3D>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
