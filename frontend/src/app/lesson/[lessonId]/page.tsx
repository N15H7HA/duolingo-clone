"use client";

import React, { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLessonStore, LessonMode } from "@/features/lesson/store/useLessonStore";
import LessonHeader from "@/features/lesson/components/LessonHeader";
import FeedbackDrawer from "@/features/lesson/components/FeedbackDrawer";
import clsx from "clsx";

// Exercise Components
import SelectExercise from "@/features/lesson/components/exercises/SelectExercise";
import TranslateExercise from "@/features/lesson/components/exercises/TranslateExercise";
import FillBlankExercise from "@/features/lesson/components/exercises/FillBlankExercise";
import MatchPairsExercise from "@/features/lesson/components/exercises/MatchPairsExercise";
import TypeAnswerExercise from "@/features/lesson/components/exercises/TypeAnswerExercise";

export default function LessonPlayerPage() {
  // 1. All hooks declared unconditionally at the very top
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawLessonId = params?.lessonId;
  const lessonId = Array.isArray(rawLessonId) ? rawLessonId[0] : (rawLessonId as string);

  const practiceType = (searchParams.get("type") || (lessonId === "mistakes" ? "mistakes" : undefined)) as string | undefined;
  const modeParam = (searchParams.get("mode") || (practiceType === "timed" ? "timed" : undefined)) as LessonMode | undefined;

  const {
    exercises,
    currentIndex,
    selectedAnswer,
    selectedWords,
    status,
    mode,
    hearts,
    strikesRemaining,
    maxStrikes,
    timeRemaining,
    bonusTimeAdded,
    heartLostTrigger,
    feedback,
    lessonTitle,
    isPractice,
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
    tickTimer,
    abandonLesson,
  } = useLessonStore();

  // 2. Initialize session on mount
  useEffect(() => {
    if (lessonId) {
      console.log(
        `[LessonPlayerPage] Mounting lesson session (ID: ${lessonId}, practiceType: ${practiceType}, mode: ${modeParam})`
      );
      const isPracticeSession =
        lessonId === "practice" ||
        lessonId === "mistakes" ||
        Boolean(practiceType) ||
        modeParam === "timed";
      startLesson(lessonId, isPracticeSession, practiceType, modeParam);
    } else {
      console.warn("[LessonPlayerPage] Mounted without valid lessonId param");
    }
    return () => {
      abandonLesson();
    };
  }, [lessonId, practiceType, modeParam, startLesson, abandonLesson]);

  // 3. Timed Practice Countdown Interval
  useEffect(() => {
    if (mode !== "timed" || isLoading) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, isLoading, tickTimer]);

  // 4. Global Enter key listener for instant check / continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const currentEx = exercises[currentIndex];
        const hasSel = Boolean(
          selectedAnswer || (currentEx?.type === "translate" && selectedWords.length > 0)
        );

        if (status === "idle" && hasSel) {
          submitAnswer();
        } else if (status === "correct" || status === "incorrect" || status === "time_up") {
          nextExercise();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, selectedAnswer, selectedWords, exercises, currentIndex, submitAnswer, nextExercise]);

  // 5. Navigate on completion (must run unconditionally before any early returns)
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
        mode: mode || "standard",
        legendary: completionResult.is_legendary ? "true" : "false",
      });
      router.push(`/lesson/${lessonId}/complete?${queryParams.toString()}`);
    }
  }, [status, completionResult, totalInitialExercises, mistakesCount, startTime, lessonTitle, lessonId, mode, router]);

  // 6. Early returns ONLY after all hooks are declared
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-snow">
        <div className="text-center space-y-4">
          <span className="text-6xl animate-bounce">
            {modeParam === "legendary" ? "👑" : modeParam === "timed" || practiceType === "timed" ? "⏱️" : "🦉"}
          </span>
          <p className="font-extrabold text-wolf uppercase tracking-wider text-sm">
            {modeParam === "legendary"
              ? "Preparing Legendary Challenge..."
              : modeParam === "timed" || practiceType === "timed"
              ? "Arming Speed Challenge..."
              : "Loading your lesson..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    const isOutOfHearts = error.toLowerCase().includes("hearts");
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-snow p-6 text-center space-y-5">
        <span className="text-5xl">{isOutOfHearts ? "💔" : "⚠️"}</span>
        <h2 className="text-2xl font-black text-cardinal">
          {isOutOfHearts ? "Out of Hearts" : "Unable to start lesson"}
        </h2>
        <p className="text-wolf font-bold text-sm max-w-sm">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isOutOfHearts && (
            <button
              onClick={() => startLesson(lessonId, true)}
              className="px-6 py-3 bg-featherGreen text-snow border-b-4 border-featherGreenShadow rounded-2xl font-black hover:brightness-105 active:translate-y-1 transition"
            >
              Practice to Earn Hearts
            </button>
          )}
          <button
            onClick={() => router.push("/learn")}
            className="px-6 py-3 bg-polar border-2 border-swan rounded-2xl font-black text-eel hover:bg-swan/40 transition"
          >
            Return to Learning Path
          </button>
        </div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex h-screen items-center justify-center bg-snow">
        <div className="text-center space-y-4">
          <span className="text-6xl animate-bounce">
            {mode === "legendary" ? "👑" : "🎉"}
          </span>
          <p className="font-extrabold text-wolf uppercase tracking-wider text-sm">
            {mode === "legendary" ? "Legendary Challenge Mastered!" : "Completing lesson..."}
          </p>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];
  if (!currentExercise) return null;

  // Calculate smooth progress percentage strictly based on unique correct exercises
  const total = Math.max(1, totalInitialExercises || exercises.length);
  const progressPercentage = (completedCount / total) * 100;

  const hasSelection = Boolean(
    selectedAnswer ||
    (currentExercise.type === "translate" && selectedWords.length > 0)
  );

  return (
    <div
      className={clsx(
        "flex flex-col min-h-screen select-none pb-36 transition-colors duration-300",
        mode === "legendary"
          ? "bg-purple-950/5 dark:bg-[#13111C]"
          : "bg-white dark:bg-[#131F24]"
      )}
    >
      {/* Top Header with Progress, Timer, and Heart/Strike Counter */}
      <LessonHeader
        progressPercentage={progressPercentage}
        hearts={hearts}
        mode={mode}
        timeRemaining={timeRemaining}
        strikesRemaining={strikesRemaining}
        maxStrikes={maxStrikes}
        bonusTimeAdded={bonusTimeAdded}
        heartLostTrigger={heartLostTrigger}
        isPractice={isPractice}
        onQuit={abandonLesson}
      />

      {/* Main Exercise Stage */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-8 py-6 flex flex-col justify-center">
        <div
          className={clsx(
            "space-y-6 transition-transform will-change-transform",
            status === "incorrect" ? "animate-shake" : ""
          )}
        >
          {/* Exercise Prompt */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3C3C3C] dark:text-white text-center mb-8">
            {currentExercise.prompt}
          </h2>

          {/* Exercise Renderers */}
          {currentExercise.type === "select" && (
            <SelectExercise
              key={currentExercise.id}
              exercise={currentExercise}
              value={selectedAnswer}
              onChange={selectOption}
              disabled={status === "correct" || status === "incorrect"}
            />
          )}

          {currentExercise.type === "translate" && (
            <TranslateExercise
              key={currentExercise.id}
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
              key={currentExercise.id}
              exercise={currentExercise}
              value={selectedAnswer}
              onChange={selectOption}
              disabled={status === "correct" || status === "incorrect"}
            />
          )}

          {currentExercise.type === "match_pairs" && (
            <MatchPairsExercise
              key={currentExercise.id}
              exercise={currentExercise}
              onChange={selectOption}
              disabled={status === "correct" || status === "incorrect"}
            />
          )}

          {currentExercise.type === "type_answer" && (
            <TypeAnswerExercise
              key={currentExercise.id}
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
        mode={mode}
        feedback={feedback}
        hasSelection={hasSelection}
        onCheck={submitAnswer}
        onContinue={nextExercise}
        onSkip={nextExercise}
        onPractice={() => startLesson(lessonId, true)}
        onRetry={() => startLesson(lessonId, false, undefined, "legendary")}
      />
    </div>
  );
}
