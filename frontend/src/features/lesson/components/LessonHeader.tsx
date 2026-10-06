"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Heart } from "lucide-react";
import Button3D from "@/components/ui/Button3D";

interface LessonHeaderProps {
  progressPercentage: number;
  hearts: number;
  onQuit: () => void;
}

export default function LessonHeader({
  progressPercentage,
  hearts,
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
      <header className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-6 select-none">
        {/* Quit X Button */}
        <button
          onClick={() => setShowQuitModal(true)}
          className="text-wolf hover:text-eel p-1.5 rounded-xl hover:bg-polar transition cursor-pointer"
          title="Quit Lesson"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 bg-swan h-4 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="bg-featherGreen h-full rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${Math.max(5, Math.min(100, progressPercentage))}%` }}
          >
            {/* Lighter top stripe highlight */}
            <div className="absolute top-0.5 left-2 right-2 h-1 bg-maskGreen rounded-full opacity-80" />
          </div>
        </div>

        {/* Hearts Counter */}
        <div className="flex items-center gap-1.5 font-black text-cardinal">
          <Heart className="w-6 h-6 fill-cardinal stroke-cardinal drop-shadow-sm animate-pulse" />
          <span className="text-lg font-black">{hearts}</span>
        </div>
      </header>

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-eel/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-snow rounded-3xl p-6 sm:p-8 max-w-sm w-full border-2 border-swan shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-feedbackRedBg mx-auto flex items-center justify-center text-3xl">
              🥺
            </div>
            <h3 className="text-2xl font-black text-eel">Are you sure?</h3>
            <p className="text-sm font-bold text-wolf">
              You will lose all progress for this lesson session.
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
