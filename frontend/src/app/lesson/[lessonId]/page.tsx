"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLessonStore } from "@/features/lesson/store/useLessonStore";
import LessonHeader from "@/features/lesson/components/LessonHeader";
import FeedbackDrawer from "@/features/lesson/components/FeedbackDrawer";
import LessonCelebration from "@/features/lesson/components/LessonCelebration";

// Exercise Components
import SelectExercise from "@/features/lesson/components/exercises/SelectExercise";
import TranslateExercise from "@/features/lesson/components/exercises/TranslateExercise";
import FillBlankExercise from "@/features/lesson/components/exercises/FillBlankExercise";
import MatchPairsExercise from "@/features/lesson/components/exercises/MatchPairsExercise";
import TypeAnswerExercise from "@/features/lesson/components/exercises/TypeAnswerExercise";

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const {
    exercises,
    currentIndex,
    selectedAnswer,
    selectedWords,
    status,
    hearts,
    feedback,
    lessonTitle,
    completionResult,
    completedCount,
    totalInitialExercises,
    mistakesCount,
    startTime,
    isLoading,
    error,
    startLesson,
    selectOption,
    addWordTile,
    removeWordTile,
    removeLastWordTile,
    submitAnswer,
    nextExercise,
    abandonLesson,
  } = useLessonStore();

  // Initialize session on mount
  useEffect(() => {
    if (lessonId) {
      startLesson(lessonId);
    }
    return () => {
      abandonLesson();
    };
  }, [lessonId, startLesson, abandonLesson]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-snow">
        <div className="text-center space-y-4">
          <span className="text-6xl animate-bounce">🦉</span>
          <p className="font-extrabold text-wolf uppercase tracking-wider text-sm">
            Loading your lesson...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-snow p-6 text-center space-y-4">
        <span className="text-5xl">💔</span>
        <h2 className="text-2xl font-black text-cardinal">Unable to start lesson</h2>
        <p className="text-wolf font-bold text-sm max-w-sm">{error}</p>
        <button
          onClick={() => router.push("/learn")}
          className="px-6 py-3 bg-polar border-2 border-swan rounded-2xl font-black text-eel hover:bg-swan/40 transition"
        >
          Return to Learning Path
        </button>
      </div>
    );
  }

  // Completed: Route to dedicated celebration page
  useEffect(() => {
    if (status === "completed" && completionResult) {
      const accuracy = Math.round(
        (Math.max(1, totalInitialExercises - mistakesCount) / Math.max(1, totalInitialExercises)) * 100
      );
      const timeSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const queryParams = new URLSearchParams({
        xp: String(completionResult.xp_earned),
        accuracy: String(accuracy),
        time: String(timeSeconds),
        streak: String(completionResult.streak),
        title: lessonTitle || "Spanish Lesson",
      });
      router.push(`/lesson/${lessonId}/complete?${queryParams.toString()}`);
    }
  }, [status, completionResult, totalInitialExercises, mistakesCount, startTime, lessonTitle, lessonId, router]);

  if (status === "completed") {
    return (
      <div className="flex h-screen items-center justify-center bg-snow">
        <div className="text-center space-y-4">
          <span className="text-6xl animate-bounce">🎉</span>
          <p className="font-extrabold text-wolf uppercase tracking-wider text-sm">
            Completing lesson...
          </p>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];
  if (!currentExercise) return null;

  // Calculate smooth progress percentage
  const total = Math.max(1, totalInitialExercises || exercises.length);
  const progressPercentage = (completedCount / total) * 100;

  const hasSelection = Boolean(
    selectedAnswer ||
    (currentExercise.type === "translate" && selectedWords.length > 0)
  );

  return (
    <div className="flex flex-col min-h-screen bg-snow select-none pb-32">
      {/* Top Header */}
      <LessonHeader
        progressPercentage={progressPercentage}
        hearts={hearts}
        onQuit={abandonLesson}
      />

      {/* Main Exercise View */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-8 py-6 flex flex-col justify-center">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-eel">
            {currentExercise.prompt}
          </h2>

          {/* Render Exercise Type */}
          {currentExercise.type === "select" && (
            <SelectExercise
              exercise={currentExercise}
              value={selectedAnswer}
              onChange={selectOption}
              disabled={status === "correct" || status === "incorrect"}
            />
          )}

          {currentExercise.type === "translate" && (
            <TranslateExercise
              exercise={currentExercise}
              selectedWords={selectedWords}
              onAddWord={addWordTile}
              onRemoveWord={removeWordTile}
              onRemoveLastWord={removeLastWordTile}
              disabled={status === "correct" || status === "incorrect"}
            />
          )}

          {currentExercise.type === "fill_blank" && (
            <FillBlankExercise
              exercise={currentExercise}
              value={selectedAnswer}
              onChange={selectOption}
              disabled={status === "correct" || status === "incorrect"}
            />
          )}

          {currentExercise.type === "match_pairs" && (
            <MatchPairsExercise
              exercise={currentExercise}
              onChange={selectOption}
              disabled={status === "correct" || status === "incorrect"}
            />
          )}

          {currentExercise.type === "type_answer" && (
            <TypeAnswerExercise
              exercise={currentExercise}
              value={selectedAnswer}
              onChange={selectOption}
              disabled={status === "correct" || status === "incorrect"}
            />
          )}
        </div>
      </main>

      {/* Bottom Interactive Feedback Drawer */}
      <FeedbackDrawer
        status={status}
        feedback={feedback}
        hasSelection={hasSelection}
        onCheck={submitAnswer}
        onContinue={nextExercise}
        onPractice={() => startLesson(lessonId, true)}
      />
    </div>
  );
}
