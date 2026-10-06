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
      <header className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-4 select-none">
        {/* Close ✕ button */}
        <button
          type="button"
          onClick={() => setShowQuitModal(true)}
          className="text-[#777777] hover:text-[#4B4B4B] p-2 rounded-xl hover:bg-[#F7F7F7] transition cursor-pointer"
          title="Quit Lesson"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Thick Rounded Progress Bar */}
        <div className="h-4 bg-[#E5E5E5] rounded-full overflow-hidden flex-1 mx-4 sm:mx-6 relative shadow-inner">
          <div
            className="bg-[#58CC02] h-full rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${Math.max(5, Math.min(100, progressPercentage))}%` }}
          >
            {/* Top highlight stripe */}
            <div className="absolute top-0.5 left-2 right-2 h-1 bg-[#89E219] rounded-full opacity-80" />
          </div>
        </div>

        {/* Hearts Counter */}
        <div className="flex items-center gap-1.5 font-extrabold text-[#FF4B4B]">
          <Heart className="w-6 h-6 fill-[#FF4B4B] stroke-[#FF4B4B] drop-shadow-sm animate-pulse" />
          <span className="text-xl font-extrabold">{hearts}</span>
        </div>
      </header>

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4B4B4B]/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border-2 border-[#E5E5E5] shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FFDFE0] mx-auto flex items-center justify-center text-3xl">
              🥺
            </div>
            <h3 className="text-2xl font-black text-[#4B4B4B]">Quit lesson?</h3>
            <p className="text-sm font-bold text-[#777777]">
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
