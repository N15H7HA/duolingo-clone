"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Heart } from "lucide-react";
import Button3D from "@/components/ui/Button3D";
import clsx from "clsx";

interface LessonHeaderProps {
  progressPercentage: number;
  hearts: number;
  heartLostTrigger?: boolean;
  isPractice?: boolean;
  onQuit: () => void;
}

export default function LessonHeader({
  progressPercentage,
  hearts,
  heartLostTrigger = false,
  isPractice = false,
  onQuit,
}: LessonHeaderProps) {
  const router = useRouter();
  const [showQuitModal, setShowQuitModal] = useState(false);

  const handleConfirmQuit = () => {
    setShowQuitModal(false);
    onQuit();
    router.push("/learn");
  };

  return (
    <>
      <header className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between select-none">
        {/* Close ✕ button */}
        <button
          type="button"
          onClick={() => setShowQuitModal(true)}
          className="text-[#AFAFAF] dark:text-[#8598A3] hover:opacity-80 p-2 rounded-xl transition cursor-pointer"
          title="Quit Lesson"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Progress Bar: rounded track with animated green fill */}
        <div className="bg-[#E5E5E5] dark:bg-[#263843] rounded-full h-4 mx-4 sm:mx-8 flex-1 overflow-hidden relative shadow-inner">
          <div
            className="bg-[#58CC02] h-full rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${Math.max(5, Math.min(100, progressPercentage))}%` }}
          >
            {/* Glossy top stripe */}
            <div className="absolute top-0.5 left-2 right-2 h-1 bg-[#89E219] rounded-full opacity-80" />
          </div>
        </div>

        {/* Hearts counter / Practice badge */}
        {isPractice ? (
          <div className="flex items-center gap-1.5 font-extrabold text-[#58CC02] bg-[#D7FFB8] dark:bg-[#142B1A] px-3 py-1 rounded-full border border-[#58CC02]/30 shadow-xs">
            <Heart className="w-4 h-4 fill-[#58CC02] stroke-[#58CC02]" />
            <span className="text-xs font-black tracking-wider uppercase">Practice (∞)</span>
          </div>
        ) : (
          <div
            className={clsx(
              "flex items-center gap-1.5 font-extrabold text-[#FF4B4B] transition-transform",
              heartLostTrigger ? "animate-heart-loss scale-110" : ""
            )}
          >
            <Heart
              className={clsx(
                "w-6 h-6 fill-[#FF4B4B] stroke-[#FF4B4B] drop-shadow-sm transition-transform",
                heartLostTrigger ? "scale-125 fill-[#EA2B2B] stroke-[#EA2B2B]" : ""
              )}
            />
            <span className="text-xl font-extrabold">{hearts}</span>
          </div>
        )}
      </header>

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#18272F] rounded-3xl p-6 sm:p-8 max-w-sm w-full border-2 border-[#E5E5E5] dark:border-[#263843] shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FFDFE0] dark:bg-[#33181A] mx-auto flex items-center justify-center text-3xl">
              🥺
            </div>
            <h3 className="text-2xl font-black text-[#4B4B4B] dark:text-white">Quit lesson?</h3>
            <p className="text-sm font-bold text-[#777777] dark:text-[#8598A3]">
              All progress in this session will be lost.
            </p>
            <div className="space-y-2.5 pt-2">
              <Button3D
                variant="blue"
                fullWidth
                size="md"
                onClick={() => setShowQuitModal(false)}
              >
                Keep Learning
              </Button3D>
              <Button3D
                variant="red"
                fullWidth
                size="md"
                onClick={handleConfirmQuit}
              >
                End Session
              </Button3D>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
