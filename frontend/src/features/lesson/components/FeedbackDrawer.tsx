"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, AlertCircle } from "lucide-react";
import { LessonStatus } from "../store/useLessonStore";
import Button3D from "@/components/ui/Button3D";
import clsx from "clsx";

interface FeedbackDrawerProps {
  status: LessonStatus;
  feedback: {
    correct: boolean;
    solution?: string;
    accent_warning?: boolean;
  } | null;
  hasSelection: boolean;
  onCheck: () => void;
  onContinue: () => void;
  onPractice: () => void;
}

export default function FeedbackDrawer({
  status,
  feedback,
  hasSelection,
  onCheck,
  onContinue,
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

  const isFeedbackActive = status === "correct" || status === "incorrect";

  return (
    <>
      <footer
        className={clsx(
          "fixed bottom-0 left-0 right-0 z-40 transition-all duration-250 ease-out border-t-2 select-none",
          status === "correct"
            ? "bg-feedbackGreenBg border-featherGreenShadow py-6 sm:py-8"
            : status === "incorrect"
            ? "bg-feedbackRedBg border-cardinalShadow py-6 sm:py-8"
            : "bg-snow border-swan py-5 sm:py-6"
        )}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Feedback Message */}
          {status === "correct" && (
            <div className="flex items-center gap-4 w-full sm:w-auto animate-in slide-in-from-bottom-2 duration-200">
              <div className="w-12 h-12 rounded-full bg-featherGreen text-snow flex items-center justify-center font-black text-2xl shadow-sm">
                <Check className="w-7 h-7 stroke-[3.5]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-featherGreen">
                  {feedback?.accent_warning ? "Good! (Check your accents)" : "Great job!"}
                </h3>
                {feedback?.accent_warning && (
                  <p className="text-xs sm:text-sm font-bold text-featherGreenShadow">
                    Accented solution: <span className="font-extrabold underline">{feedback.solution}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {status === "incorrect" && (
            <div className="flex items-start gap-4 w-full sm:w-auto animate-in slide-in-from-bottom-2 duration-200">
              <div className="w-12 h-12 rounded-full bg-cardinal text-snow flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                <X className="w-7 h-7 stroke-[3.5]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-cardinal">
                  Correct solution:
                </h3>
                <p className="text-base sm:text-lg font-black text-cardinalShadow">
                  {feedback?.solution || "Check answer"}
                </p>
              </div>
            </div>
          )}

          {!isFeedbackActive && <div className="hidden sm:block" />}

          {/* Action Button */}
          <div className="w-full sm:w-48">
            {status === "correct" && (
              <Button3D
                variant="green"
                fullWidth
                size="lg"
                onClick={onContinue}
              >
                Continue
              </Button3D>
            )}

            {status === "incorrect" && (
              <Button3D
                variant="red"
                fullWidth
                size="lg"
                onClick={onContinue}
              >
                Got It
              </Button3D>
            )}

            {(status === "idle" || status === "checking") && (
              <Button3D
                variant={hasSelection ? "green" : "disabled"}
                fullWidth
                size="lg"
                disabled={!hasSelection || status === "checking"}
                onClick={onCheck}
              >
                {status === "checking" ? "Checking..." : "Check"}
              </Button3D>
            )}
          </div>
        </div>
      </footer>

      {/* Out of Hearts Modal */}
      {status === "out_of_hearts" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-eel/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-snow rounded-3xl p-6 sm:p-8 max-w-sm w-full border-2 border-swan shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-feedbackRedBg mx-auto flex items-center justify-center text-3xl">
              💔
            </div>
            <h3 className="text-2xl font-black text-eel">Out of Hearts!</h3>
            <p className="text-sm font-bold text-wolf">
              You ran out of hearts in this session. Practice in review mode to earn more hearts or refill with gems.
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
