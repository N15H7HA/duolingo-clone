"use client";

import React, { useState } from "react";
import { Flame, Gem, Heart } from "lucide-react";
import { useMe, useHeartRefill } from "@/hooks/useDuolingo";
import Button3D from "./Button3D";

export default function TopBar() {
  const { data: user } = useMe();
  const heartRefill = useHeartRefill();
  const [showHeartModal, setShowHeartModal] = useState(false);

  if (!user) {
    return (
      <header className="sticky top-0 z-30 h-14 sm:h-16 w-full bg-white/90 dark:bg-[#131F24]/90 backdrop-blur border-b-2 border-[#E5E5E5] dark:border-[#263843] px-4 sm:px-8 flex items-center justify-between">
        <div className="h-6 w-20 bg-[#E5E5E5] dark:bg-[#263843] rounded-lg animate-pulse" />
        <div className="flex gap-4">
          <div className="h-6 w-12 bg-[#E5E5E5] dark:bg-[#263843] rounded-lg animate-pulse" />
          <div className="h-6 w-12 bg-[#E5E5E5] dark:bg-[#263843] rounded-lg animate-pulse" />
          <div className="h-6 w-12 bg-[#E5E5E5] dark:bg-[#263843] rounded-lg animate-pulse" />
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
      <header className="sticky top-0 z-30 h-14 sm:h-16 w-full bg-white/95 dark:bg-[#131F24]/95 backdrop-blur-md border-b-2 border-[#E5E5E5] dark:border-[#263843] px-4 sm:px-8 flex items-center justify-between transition-all select-none">
        {/* Spanish Flag Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#F7F7F7] dark:hover:bg-[#18272F] cursor-pointer border border-transparent hover:border-[#E5E5E5] dark:hover:border-[#263843] transition-all touch-manipulation min-h-[44px]">
          <span className="text-2xl drop-shadow-sm">🇪🇸</span>
          <span className="hidden sm:inline font-extrabold text-sm uppercase text-[#4B4B4B] dark:text-white tracking-wider">
            Spanish
          </span>
        </div>

        {/* Gamification Stats */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Streak Fire Icon */}
          <div className="flex items-center gap-1.5 font-extrabold text-[#FF9600] hover:bg-[#F7F7F7] dark:hover:bg-[#18272F] px-2 sm:px-2.5 py-1.5 rounded-xl transition cursor-default min-h-[44px]">
            <Flame className="w-5 sm:w-6 h-5 sm:h-6 fill-[#FF9600] stroke-[#FF9600] drop-shadow-sm" />
            <span className="text-sm sm:text-base font-extrabold">{user.streak}</span>
          </div>

          {/* Gem Diamond Icon */}
          <div className="flex items-center gap-1.5 font-extrabold text-[#1CB0F6] hover:bg-[#F7F7F7] dark:hover:bg-[#18272F] px-2 sm:px-2.5 py-1.5 rounded-xl transition cursor-default min-h-[44px]">
            <Gem className="w-5 h-5 fill-[#1CB0F6] stroke-[#1CB0F6] drop-shadow-sm" />
            <span className="text-sm sm:text-base font-extrabold">{user.gems}</span>
          </div>

          {/* Heart Icon */}
          <button
            onClick={() => setShowHeartModal(true)}
            className="flex items-center gap-1.5 font-extrabold text-[#FF4B4B] hover:bg-[#F7F7F7] dark:hover:bg-[#18272F] px-2 sm:px-2.5 py-1.5 rounded-xl transition cursor-pointer border border-transparent hover:border-[#E5E5E5] dark:hover:border-[#263843] touch-manipulation min-h-[44px]"
            title="Click to refill hearts"
          >
            <Heart className="w-5 h-5 fill-[#FF4B4B] stroke-[#FF4B4B] drop-shadow-sm animate-pulse" />
            <span className="text-sm sm:text-base font-extrabold">{user.hearts}</span>
          </button>
        </div>
      </header>

      {/* Heart Refill Modal */}
      {showHeartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18272F] rounded-3xl p-6 max-w-md w-full border-2 border-[#E5E5E5] dark:border-[#263843] shadow-2xl relative">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FFDFE0] dark:bg-[#33181A] flex items-center justify-center mx-auto mb-4 border border-[#FF4B4B]/20">
                <Heart className="w-10 h-10 fill-[#FF4B4B] stroke-[#FF4B4B]" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#4B4B4B] dark:text-white mb-2">
                Hearts & Refill
              </h3>
              <p className="text-[#777777] dark:text-[#8598A3] text-sm font-bold mb-4">
                You have <span className="text-[#FF4B4B] font-extrabold">{user.hearts} of 5 hearts</span>.
                {user.hearts < 5 ? (
                  <>
                    <br />
                    Next heart regenerates in:{" "}
                    <span className="text-[#1CB0F6] font-extrabold">
                      {Math.ceil(user.next_heart_in_seconds / 60)} mins
                    </span>
                  </>
                ) : (
                  " Your hearts are full!"
                )}
              </p>

              {user.hearts < 5 && (
                <div className="p-4 bg-[#F7F7F7] dark:bg-[#131F24] rounded-2xl border border-[#E5E5E5] dark:border-[#263843] mb-4 flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-extrabold text-[#4B4B4B] dark:text-white text-sm">Full Refill</p>
                    <p className="text-[#777777] dark:text-[#8598A3] text-xs font-semibold">
                      Refill all 5 hearts instantly
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[#1CB0F6] font-extrabold text-sm">
                    <Gem className="w-4 h-4 fill-[#1CB0F6]" />
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
                    {heartRefill.isPending
                      ? "Refilling..."
                      : user.gems < 350
                      ? "Not Enough Gems"
                      : "Refill for 350 Gems"}
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
