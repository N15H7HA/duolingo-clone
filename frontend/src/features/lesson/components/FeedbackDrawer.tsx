"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { LessonStatus } from "../store/useLessonStore";
import Button3D from "@/components/ui/Button3D";
import clsx from "clsx";

interface FeedbackDrawerProps {
  status: LessonStatus;
  feedback: {
    correct: boolean;
    solution?: string;
    accent_warning?: boolean;
    cheerTitle?: string;
  } | null;
  hasSelection: boolean;
  onCheck: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  onPractice: () => void;
}

export default function FeedbackDrawer({
  status,
  feedback,
  hasSelection,
  onCheck,
  onContinue,
  onSkip,
  onPractice,
}: FeedbackDrawerProps) {
  const router = useRouter();

  // Keyboard shortcut listener: Enter triggers Check or Continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (status === "idle" && hasSelection) {
          onCheck();
        } else if (status === "correct" || status === "incorrect") {
          onContinue();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, hasSelection, onCheck, onContinue]);

  const isCorrect = status === "correct";
  const isIncorrect = status === "incorrect";
  const isFeedbackActive = isCorrect || isIncorrect;

  return (
    <>
      <footer
        className={clsx(
          "fixed bottom-0 left-0 right-0 z-40 min-h-[120px] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] border-t-2 select-none px-6 sm:px-12 py-6 flex items-center",
          isCorrect
            ? "bg-[#D7FFB8] dark:bg-[#142B1A] border-[#58A700]"
            : isIncorrect
            ? "bg-[#FFDFE0] dark:bg-[#33181A] border-[#EA2B2B]"
            : "bg-white dark:bg-[#131F24] border-[#E5E5E5] dark:border-[#263843]"
        )}
      >
        <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* 1. Correct Feedback Drawer Content */}
          {isCorrect && (
            <div className="flex items-center gap-4 w-full sm:w-auto animate-in slide-in-from-bottom-2 duration-150">
              <div className="w-14 h-14 rounded-full bg-[#58CC02] text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                <Check className="w-8 h-8 stroke-[3.5]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#58A700] dark:text-[#58CC02]">
                  {feedback?.accent_warning
                    ? "Nicely done! (Pay attention to accents)"
                    : feedback?.cheerTitle || "Nicely done!"}
                </h3>
                {feedback?.accent_warning && (
                  <p className="text-xs sm:text-sm font-bold text-[#58A700] dark:text-[#58CC02]">
                    Accented solution: <span className="font-extrabold underline">{feedback.solution}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 2. Incorrect Feedback Drawer Content */}
          {isIncorrect && (
            <div className="flex items-start gap-4 w-full sm:w-auto animate-in slide-in-from-bottom-2 duration-150">
              <div className="w-14 h-14 rounded-full bg-[#FF4B4B] text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                <X className="w-8 h-8 stroke-[3.5]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#EA2B2B] dark:text-[#FF4B4B]">
                  Correct solution:
                </h3>
                <p className="text-base sm:text-lg font-extrabold text-[#EA2B2B] dark:text-[#FFDFE0]">
                  {feedback?.solution || "Check answer"}
                </p>
              </div>
            </div>
          )}

          {/* 3. Idle Left: Outline SKIP Button */}
          {!isFeedbackActive && (
            <div className="hidden sm:block">
              <button
                type="button"
                onClick={onSkip || onCheck}
                className="px-6 py-3 rounded-2xl font-extrabold text-sm uppercase tracking-wider text-[#AFAFAF] dark:text-[#8598A3] border-2 border-[#E5E5E5] dark:border-[#263843] border-b-4 hover:bg-[#F7F7F7] dark:hover:bg-[#1F333D] active:translate-y-1 active:border-b-2 transition-all cursor-pointer"
              >
                SKIP
              </button>
            </div>
          )}

          {/* 4. Action Button (Right aligned) */}
          <div className="w-full sm:w-44 ml-auto">
            {isCorrect && (
              <Button3D
                variant="green"
                fullWidth
                size="md"
                onClick={onContinue}
              >
                CONTINUE
              </Button3D>
            )}

            {isIncorrect && (
              <Button3D
                variant="red"
                fullWidth
                size="md"
                onClick={onContinue}
              >
                CONTINUE
              </Button3D>
            )}

            {!isFeedbackActive && (
              <Button3D
                variant={hasSelection ? "green" : "disabled"}
                fullWidth
                size="md"
                disabled={!hasSelection || status === "checking"}
                onClick={onCheck}
              >
                {status === "checking" ? "CHECKING..." : "CHECK"}
              </Button3D>
            )}
          </div>
        </div>
      </footer>

      {/* Out of Hearts Modal */}
      {status === "out_of_hearts" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18272F] rounded-3xl p-6 sm:p-8 max-w-sm w-full border-2 border-[#E5E5E5] dark:border-[#263843] shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FFDFE0] dark:bg-[#33181A] mx-auto flex items-center justify-center text-3xl">
              💔
            </div>
            <h3 className="text-2xl font-black text-[#4B4B4B] dark:text-white">Out of Hearts!</h3>
            <p className="text-sm font-bold text-[#777777] dark:text-[#8598A3]">
              You ran out of hearts in this session. Practice to earn hearts back or refill with gems.
            </p>
            <div className="space-y-2.5 pt-2">
              <Button3D
                variant="green"
                fullWidth
                size="md"
                onClick={onPractice}
              >
                Practice for Hearts
              </Button3D>
              <Button3D
                variant="white"
                fullWidth
                size="md"
                onClick={() => router.push("/learn")}
              >
                Back to Path
              </Button3D>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
