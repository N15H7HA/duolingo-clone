"use client";

import { create } from "zustand";
import { fetchApi } from "@/lib/api";
import {
  StrippedExercise,
  LessonStartResponse,
  AnswerFeedbackResponse,
  AttemptCompleteResponse,
} from "@/types";
import { sound, playSound } from "@/lib/sound";

export type LessonStatus =
  | "idle"
  | "checking"
  | "correct"
  | "incorrect"
  | "out_of_hearts"
  | "time_up"
  | "completed";

export type LessonMode =
  | "standard"
  | "practice"
  | "mistakes"
  | "timed"
  | "legendary";

interface LessonState {
  attemptId: number | null;
  lessonId: number | null;
  lessonTitle: string;
  mode: LessonMode;
  isPractice: boolean;
  exercises: StrippedExercise[];
  currentIndex: number;
  selectedAnswer: string | null;
  selectedWords: string[];
  status: LessonStatus;
  hearts: number;
  strikesRemaining: number;
  maxStrikes: number;
  timeRemaining: number;
  timeLimit: number;
  bonusTimeAdded: number | null;
  heartLostTrigger: boolean;
  feedback: {
    correct: boolean;
    solution?: string;
    accent_warning?: boolean;
    cheerTitle?: string;
  } | null;
  mistakesCount: number;
  completedCount: number;
  uniqueCorrectIds: number[];
  totalInitialExercises: number;
  startTime: number;
  completionResult: AttemptCompleteResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  startLesson: (
    lessonId: number | string,
    isPractice?: boolean,
    practiceType?: string,
    modeParam?: LessonMode
  ) => Promise<void>;
  selectOption: (val: string) => void;
  addWordTile: (word: string) => void;
  removeWordTile: (index: number) => void;
  removeLastWordTile: () => void;
  submitAnswer: () => Promise<void>;
  nextExercise: () => Promise<void>;
  tickTimer: () => void;
  handleTimeUp: () => Promise<void>;
  abandonLesson: () => void;
}

const CORRECT_CHEERS = ["Amazing!", "Nicely done!", "Great job!", "Superb!", "Spot on!"];

export const useLessonStore = create<LessonState>((set, get) => ({
  attemptId: null,
  lessonId: null,
  lessonTitle: "",
  mode: "standard",
  isPractice: false,
  exercises: [],
  currentIndex: 0,
  selectedAnswer: null,
  selectedWords: [],
  status: "idle",
  hearts: 5,
  strikesRemaining: 3,
  maxStrikes: 3,
  timeRemaining: 90,
  timeLimit: 90,
  bonusTimeAdded: null,
  heartLostTrigger: false,
  feedback: null,
  mistakesCount: 0,
  completedCount: 0,
  uniqueCorrectIds: [],
  totalInitialExercises: 0,
  startTime: Date.now(),
  completionResult: null,
  isLoading: true,
  error: null,

  startLesson: async (
    lessonId: number | string,
    isPractice = false,
    practiceType?: string,
    modeParam?: LessonMode
  ) => {
    const isMistakesMode =
      practiceType === "mistakes" ||
      lessonId === "mistakes" ||
      lessonId === "practice-mistakes";
    const isTimedMode =
      practiceType === "timed" ||
      modeParam === "timed" ||
      lessonId === "timed";
    const isLegendaryMode =
      modeParam === "legendary" ||
      practiceType === "legendary" ||
      lessonId === "legendary";
    const isPracticeMode = isPractice || isMistakesMode || isTimedMode || lessonId === "practice";

    let effectiveMode: LessonMode = "standard";
    if (isLegendaryMode) effectiveMode = "legendary";
    else if (isTimedMode) effectiveMode = "timed";
    else if (isMistakesMode) effectiveMode = "mistakes";
    else if (isPracticeMode) effectiveMode = "practice";

    console.log(
      `[LessonStore] Starting session (ID: ${lessonId}, Mode: ${effectiveMode})`
    );
    set({ isLoading: true, error: null, heartLostTrigger: false, bonusTimeAdded: null });
    try {
      let endpoint = `/lessons/${lessonId}/start`;
      if (effectiveMode === "legendary") {
        endpoint = `/lessons/${lessonId}/legendary/start`;
      } else if (effectiveMode === "timed") {
        endpoint = "/practice/timed/start";
      } else if (effectiveMode === "mistakes") {
        endpoint = "/practice/mistakes/start";
      } else if (effectiveMode === "practice") {
        endpoint = "/practice/start";
      }

      const data = await fetchApi<LessonStartResponse>(endpoint, {
        method: "POST",
      });

      console.log(
        `[LessonStore] Initialized: Attempt #${data.attempt_id}, Mode: "${data.mode || effectiveMode}", Exercises: ${data.exercises.length}`
      );

      const resolvedMode = (data.mode as LessonMode) || effectiveMode;
      const initialTime = data.time_limit_seconds || 90;
      const maxStrikes = data.max_strikes || 3;

      set({
        attemptId: data.attempt_id,
        lessonId: typeof lessonId === "number" ? lessonId : data.lesson_id,
        lessonTitle: data.lesson_title,
        mode: resolvedMode,
        isPractice: data.is_practice || resolvedMode === "timed" || resolvedMode === "mistakes" || resolvedMode === "practice",
        exercises: data.exercises,
        currentIndex: 0,
        selectedAnswer: null,
        selectedWords: [],
        status: "idle",
        hearts: resolvedMode === "legendary" ? maxStrikes : 5,
        strikesRemaining: maxStrikes,
        maxStrikes: maxStrikes,
        timeRemaining: initialTime,
        timeLimit: initialTime,
        bonusTimeAdded: null,
        feedback: null,
        mistakesCount: 0,
        completedCount: 0,
        uniqueCorrectIds: [],
        totalInitialExercises: data.exercises.length,
        startTime: Date.now(),
        completionResult: null,
        isLoading: false,
      });
    } catch (err: unknown) {
      console.error(`[LessonStore] Failed to start lesson ${lessonId}:`, err);
      const msg = err instanceof Error ? err.message : "Failed to start lesson";
      set({ error: msg, isLoading: false });
    }
  },

  selectOption: (val: string) => {
    if (get().status === "correct" || get().status === "incorrect") return;
    sound.playTap();
    set({ selectedAnswer: val });
  },

  addWordTile: (word: string) => {
    if (get().status === "correct" || get().status === "incorrect") return;
    sound.playTap();
    const newWords = [...get().selectedWords, word];
    set({
      selectedWords: newWords,
      selectedAnswer: newWords.join(" "),
    });
  },

  removeWordTile: (index: number) => {
    if (get().status === "correct" || get().status === "incorrect") return;
    sound.playTap();
    const newWords = get().selectedWords.filter((_, i) => i !== index);
    set({
      selectedWords: newWords,
      selectedAnswer: newWords.length > 0 ? newWords.join(" ") : null,
    });
  },

  removeLastWordTile: () => {
    if (get().status === "correct" || get().status === "incorrect") return;
    const words = get().selectedWords;
    if (words.length === 0) return;
    sound.playTap();
    const newWords = words.slice(0, -1);
    set({
      selectedWords: newWords,
      selectedAnswer: newWords.length > 0 ? newWords.join(" ") : null,
    });
  },

  submitAnswer: async () => {
    const {
      attemptId,
      exercises,
      currentIndex,
      selectedAnswer,
      status,
      uniqueCorrectIds,
      totalInitialExercises,
      mode,
      timeRemaining,
    } = get();

    if (status !== "idle" || !selectedAnswer || attemptId === null) return;

    const currentExercise = exercises[currentIndex];
    set({ status: "checking" });

    try {
      const isRetry = currentIndex >= totalInitialExercises;
      const fb = await fetchApi<AnswerFeedbackResponse>(
        `/attempts/${attemptId}/answer`,
        {
          method: "POST",
          body: JSON.stringify({
            exercise_id: currentExercise.id,
            submitted_answer: selectedAnswer,
            is_retry: isRetry,
          }),
        }
      );

      if (fb.correct) {
        sound.playCorrect();
        const newUnique = uniqueCorrectIds.includes(currentExercise.id)
          ? uniqueCorrectIds
          : [...uniqueCorrectIds, currentExercise.id];

        const randomCheer = CORRECT_CHEERS[Math.floor(Math.random() * CORRECT_CHEERS.length)];

        // Bonus time for timed practice mode (+5 seconds)
        let updatedTime = timeRemaining;
        if (mode === "timed") {
          updatedTime = timeRemaining + 5;
        }

        set({
          status: "correct",
          hearts: fb.hearts,
          strikesRemaining: mode === "legendary" ? fb.hearts : get().strikesRemaining,
          timeRemaining: updatedTime,
          bonusTimeAdded: mode === "timed" ? 5 : null,
          uniqueCorrectIds: newUnique,
          completedCount: newUnique.length,
          heartLostTrigger: false,
          feedback: {
            correct: true,
            solution: fb.solution,
            accent_warning: fb.accent_warning,
            cheerTitle: randomCheer,
          },
        });
      } else {
        sound.playIncorrect();
        // Spaced Repetition Loop: Append failed exercise
        const updatedExercises = [...exercises, currentExercise];
        const isOutOfHearts = fb.out_of_hearts && mode !== "timed" && mode !== "mistakes" && mode !== "practice";

        set({
          status: isOutOfHearts ? "out_of_hearts" : "incorrect",
          hearts: fb.hearts,
          strikesRemaining: mode === "legendary" ? fb.hearts : get().strikesRemaining,
          heartLostTrigger: mode === "standard" || mode === "legendary",
          exercises: updatedExercises,
          mistakesCount: get().mistakesCount + 1,
          bonusTimeAdded: null,
          feedback: {
            correct: false,
            solution: fb.solution,
            accent_warning: false,
          },
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error checking answer";
      set({ error: msg, status: "idle" });
    }
  },

  nextExercise: async () => {
    const { attemptId, exercises, currentIndex, startTime, completedCount, mode } = get();

    if (currentIndex + 1 < exercises.length) {
      set({
        currentIndex: currentIndex + 1,
        selectedAnswer: null,
        selectedWords: [],
        status: "idle",
        feedback: null,
        bonusTimeAdded: null,
        heartLostTrigger: false,
      });
    } else {
      // Complete lesson
      if (mode === "legendary") {
        sound.playLegendaryComplete();
      } else {
        sound.playComplete();
      }
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      try {
        const comp = await fetchApi<AttemptCompleteResponse>(
          `/attempts/${attemptId}/complete`,
          {
            method: "POST",
            body: JSON.stringify({ duration_seconds: durationSeconds }),
          }
        );
        set({
          status: "completed",
          completionResult: comp,
          completedCount: completedCount,
        });
      } catch (err: unknown) {
        console.error("[LessonStore] Complete error:", err);
        const msg = err instanceof Error ? err.message : "Failed to complete lesson";
        set({ error: msg, status: "completed" });
      }
    }
  },

  tickTimer: () => {
    const { mode, status, timeRemaining } = get();
    if (mode !== "timed") return;
    if (status === "completed" || status === "time_up" || status === "out_of_hearts") return;

    if (timeRemaining <= 1) {
      // Time is up!
      get().handleTimeUp();
    } else {
      const newTime = timeRemaining - 1;
      if (newTime <= 10) {
        sound.playTimerWarning();
      }
      set({ timeRemaining: newTime });
    }
  },

  handleTimeUp: async () => {
    const { attemptId, startTime, completedCount } = get();
    set({ status: "time_up", timeRemaining: 0 });
    sound.playIncorrect();

    if (attemptId) {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      try {
        const comp = await fetchApi<AttemptCompleteResponse>(
          `/attempts/${attemptId}/complete`,
          {
            method: "POST",
            body: JSON.stringify({ duration_seconds: durationSeconds }),
          }
        );
        set({
          completionResult: comp,
          completedCount: completedCount,
        });
      } catch (err) {
        console.error("[LessonStore] Time up completion error:", err);
      }
    }
  },

  abandonLesson: () => {
    set({
      attemptId: null,
      lessonId: null,
      exercises: [],
      currentIndex: 0,
      selectedAnswer: null,
      selectedWords: [],
      status: "idle",
      feedback: null,
      bonusTimeAdded: null,
      heartLostTrigger: false,
      completionResult: null,
    });
  },
}));
