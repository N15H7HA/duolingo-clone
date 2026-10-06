"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, Heart, Sparkles, Check, Volume2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import {
  LessonStartResponse,
  AnswerFeedbackResponse,
  AttemptCompleteResponse,
  StrippedOption,
} from "@/types";
import Button3D from "@/components/ui/Button3D";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lessonData, setLessonData] = useState<LessonStartResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [feedback, setFeedback] = useState<AnswerFeedbackResponse | null>(null);
  const [completed, setCompleted] = useState<AttemptCompleteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [hearts, setHearts] = useState(5);

  // Load lesson session
  useEffect(() => {
    async function startLesson() {
      try {
        const data = await fetchApi<LessonStartResponse>(`/lessons/${lessonId}/start`, {
          method: "POST",
        });
        setLessonData(data);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Failed to start lesson";
        alert(errorMsg);
        router.push("/learn");
      } finally {
        setIsLoading(false);
      }
    }
    if (lessonId) {
      startLesson();
    }
  }, [lessonId, router]);

  if (isLoading || !lessonData) {
    return (
      <div className="flex h-screen items-center justify-center bg-snow">
        <div className="text-center space-y-4">
          <span className="text-6xl animate-bounce">🦉</span>
          <p className="font-extrabold text-wolf uppercase tracking-wider text-sm">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // Completion screen
  if (completed) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-snow p-6 select-none">
        <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-24 h-24 rounded-full bg-bee/20 border-4 border-bee flex items-center justify-center mx-auto text-5xl shadow-lg">
            🎉
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-bee">Lesson Complete!</h1>
          <p className="text-wolf font-bold text-sm">You did an amazing job practicing today!</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-polar rounded-2xl border-2 border-swan text-center">
              <p className="text-xs font-black uppercase text-wolf">Total XP</p>
              <p className="text-2xl font-black text-bee">+{completed.xp_earned} XP</p>
            </div>
            <div className="p-4 bg-polar rounded-2xl border-2 border-swan text-center">
              <p className="text-xs font-black uppercase text-wolf">Streak</p>
              <p className="text-2xl font-black text-fox">{completed.streak} Days</p>
            </div>
          </div>

          <Button3D variant="green" fullWidth size="lg" onClick={() => router.push("/learn")}>
            Continue
          </Button3D>
        </div>
      </div>
    );
  }

  const currentExercise = lessonData.exercises[currentIndex];
  const progressPercent = (currentIndex / lessonData.exercises.length) * 100;

  const handleSubmit = async () => {
    if (feedback) {
      // Advance to next exercise or complete
      if (currentIndex + 1 < lessonData.exercises.length) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption("");
        setTextInput("");
        setFeedback(null);
      } else {
        // Complete attempt
        const durationSeconds = Math.round((Date.now() - startTime) / 1000);
        try {
          const compData = await fetchApi<AttemptCompleteResponse>(
            `/attempts/${lessonData.attempt_id}/complete`,
            {
              method: "POST",
              body: JSON.stringify({ duration_seconds: durationSeconds }),
            }
          );
          setCompleted(compData);
        } catch {
          router.push("/learn");
        }
      }
      return;
    }

    const answer = currentExercise.type === "type_answer" ? textInput : selectedOption;
    if (!answer) return;

    setIsSubmitting(true);
    try {
      const fb = await fetchApi<AnswerFeedbackResponse>(
        `/attempts/${lessonData.attempt_id}/answer`,
        {
          method: "POST",
          body: JSON.stringify({
            exercise_id: currentExercise.id,
            submitted_answer: answer,
          }),
        }
      );
      setFeedback(fb);
      setHearts(fb.hearts);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit answer";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-snow select-none">
      {/* Lesson Header */}
      <header className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-6 flex items-center justify-between gap-6">
        <button
          onClick={() => router.push("/learn")}
          className="text-wolf hover:text-eel p-1 rounded-xl hover:bg-polar transition"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 bg-swan h-4 rounded-full overflow-hidden">
          <div
            className="bg-featherGreen h-full rounded-full transition-all duration-300 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-1 right-2 w-full h-1 bg-white/30 rounded-full" />
          </div>
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-1.5 font-black text-cardinal">
          <Heart className="w-6 h-6 fill-cardinal stroke-cardinal" />
          <span className="text-lg">{hearts}</span>
        </div>
      </header>

      {/* Main Exercise Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-8 py-6 flex flex-col justify-center">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-eel">{currentExercise.prompt}</h2>

          {/* Source Text / Prompt Card */}
          <div className="flex items-center gap-3 p-4 bg-polar rounded-2xl border-2 border-swan w-fit">
            <Volume2 className="w-5 h-5 text-macaw cursor-pointer" />
            <span className="text-lg font-black text-eel">{currentExercise.source_text}</span>
          </div>

          {/* Exercise Options (Select / Translate) */}
          {currentExercise.type !== "type_answer" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentExercise.options.map((opt: StrippedOption) => {
                const isSelected = selectedOption === opt.text;
                return (
                  <button
                    key={opt.id}
                    disabled={feedback !== null}
                    onClick={() => setSelectedOption(opt.text)}
                    className={`p-4 rounded-2xl font-extrabold text-base text-left border-2 border-b-4 transition-all ${
                      isSelected
                        ? "bg-selectedCardBg border-macaw border-b-macawShadow text-macaw"
                        : "bg-snow border-swan border-b-swan hover:bg-polar text-eel"
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          )}

          {/* Type Answer Input */}
          {currentExercise.type === "type_answer" && (
            <div className="pt-2">
              <textarea
                value={textInput}
                disabled={feedback !== null}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type in Spanish..."
                rows={3}
                className="w-full p-4 rounded-2xl border-2 border-swan bg-polar text-eel font-extrabold text-lg focus:outline-none focus:border-macaw focus:bg-snow transition"
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer / Feedback Banner */}
      <footer
        className={`border-t-2 px-4 sm:px-8 py-6 transition-colors duration-200 ${
          feedback
            ? feedback.correct
              ? "bg-feedbackGreenBg border-maskGreen/30"
              : "bg-feedbackRedBg border-cardinal/30"
            : "bg-snow border-swan"
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Feedback message */}
          {feedback ? (
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-snow font-black text-2xl ${
                  feedback.correct ? "bg-featherGreen" : "bg-cardinal"
                }`}
              >
                {feedback.correct ? "✓" : "✕"}
              </div>
              <div>
                <h3
                  className={`text-xl font-black ${
                    feedback.correct ? "text-featherGreen" : "text-cardinal"
                  }`}
                >
                  {feedback.correct
                    ? feedback.accent_warning
                      ? "Correct! (Pay attention to accents)"
                      : "Nicely done!"
                    : "Correct solution:"}
                </h3>
                {!feedback.correct && (
                  <p className="text-sm font-black text-cardinal">{feedback.solution}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden sm:block" />
          )}

          {/* Action Button */}
          <div className="w-full sm:w-48">
            <Button3D
              variant={feedback ? (feedback.correct ? "green" : "red") : "green"}
              fullWidth
              size="lg"
              disabled={(!selectedOption && !textInput) || isSubmitting}
              onClick={handleSubmit}
            >
              {feedback ? "Continue" : "Check"}
            </Button3D>
          </div>
        </div>
      </footer>
    </div>
  );
}
