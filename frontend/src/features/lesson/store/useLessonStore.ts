import { create } from "zustand";
import { fetchApi } from "@/lib/api";
import {
  StrippedExercise,
  LessonStartResponse,
  AnswerFeedbackResponse,
  AttemptCompleteResponse,
} from "@/types";

export type LessonStatus =
  | "idle"
  | "checking"
  | "correct"
  | "incorrect"
  | "out_of_hearts"
  | "completed";

interface LessonState {
  attemptId: number | null;
  lessonId: number | null;
  lessonTitle: string;
  isPractice: boolean;
  exercises: StrippedExercise[];
  currentIndex: number;
  selectedAnswer: string | null;
  selectedWords: string[];
  status: LessonStatus;
  hearts: number;
  feedback: {
    correct: boolean;
    solution?: string;
    accent_warning?: boolean;
  } | null;
  requeueQueue: StrippedExercise[];
  mistakesCount: number;
  completedCount: number;
  totalInitialExercises: number;
  startTime: number;
  completionResult: AttemptCompleteResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  startLesson: (lessonId: number | string, isPractice?: boolean) => Promise<void>;
  selectOption: (val: string) => void;
  addWordTile: (word: string) => void;
  removeWordTile: (index: number) => void;
  removeLastWordTile: () => void;
  submitAnswer: () => Promise<void>;
  nextExercise: () => Promise<void>;
  abandonLesson: () => void;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  attemptId: null,
  lessonId: null,
  lessonTitle: "",
  isPractice: false,
  exercises: [],
  currentIndex: 0,
  selectedAnswer: null,
  selectedWords: [],
  status: "idle",
  hearts: 5,
  feedback: null,
  requeueQueue: [],
  mistakesCount: 0,
  completedCount: 0,
  totalInitialExercises: 0,
  startTime: Date.now(),
  completionResult: null,
  isLoading: true,
  error: null,

  startLesson: async (lessonId, isPractice = false) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = isPractice ? "/practice/start" : `/lessons/${lessonId}/start`;
      const data = await fetchApi<LessonStartResponse>(endpoint, {
        method: "POST",
      });

      set({
        attemptId: data.attempt_id,
        lessonId: Number(lessonId),
        lessonTitle: data.lesson_title,
        isPractice: data.is_practice,
        exercises: data.exercises,
        currentIndex: 0,
        selectedAnswer: null,
        selectedWords: [],
        status: "idle",
        feedback: null,
        requeueQueue: [],
        mistakesCount: 0,
        completedCount: 0,
        totalInitialExercises: data.exercises.length,
        startTime: Date.now(),
        completionResult: null,
        isLoading: false,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start lesson";
      set({ error: msg, isLoading: false });
    }
  },

  selectOption: (val: string) => {
    if (get().status === "correct" || get().status === "incorrect") return;
    set({ selectedAnswer: val });
  },

  addWordTile: (word: string) => {
    if (get().status === "correct" || get().status === "incorrect") return;
    const newWords = [...get().selectedWords, word];
    set({
      selectedWords: newWords,
      selectedAnswer: newWords.join(" "),
    });
  },

  removeWordTile: (index: number) => {
    if (get().status === "correct" || get().status === "incorrect") return;
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
    const newWords = words.slice(0, -1);
    set({
      selectedWords: newWords,
      selectedAnswer: newWords.length > 0 ? newWords.join(" ") : null,
    });
  },

  submitAnswer: async () => {
    const { attemptId, exercises, currentIndex, selectedAnswer, status, requeueQueue } = get();
    if (status !== "idle" || !selectedAnswer || attemptId === null) return;

    const currentExercise = exercises[currentIndex];
    set({ status: "checking" });

    try {
      const fb = await fetchApi<AnswerFeedbackResponse>(
        `/attempts/${attemptId}/answer`,
        {
          method: "POST",
          body: JSON.stringify({
            exercise_id: currentExercise.id,
            submitted_answer: selectedAnswer,
            is_retry: currentIndex >= get().totalInitialExercises,
          }),
        }
      );

      if (fb.correct) {
        set({
          status: "correct",
          hearts: fb.hearts,
          feedback: {
            correct: true,
            solution: fb.solution,
            accent_warning: fb.accent_warning,
          },
        });
      } else {
        // Add to requeue list if not already queued
        const newRequeue = [...requeueQueue];
        if (!newRequeue.some((e) => e.id === currentExercise.id)) {
          newRequeue.push(currentExercise);
        }

        set({
          status: fb.out_of_hearts ? "out_of_hearts" : "incorrect",
          hearts: fb.hearts,
          requeueQueue: newRequeue,
          mistakesCount: get().mistakesCount + 1,
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
    const {
      attemptId,
      exercises,
      currentIndex,
      requeueQueue,
      status,
      startTime,
      completedCount,
    } = get();

    const wasCorrect = status === "correct";
    const nextCompleted = wasCorrect ? completedCount + 1 : completedCount;

    if (currentIndex + 1 < exercises.length) {
      set({
        currentIndex: currentIndex + 1,
        selectedAnswer: null,
        selectedWords: [],
        status: "idle",
        feedback: null,
        completedCount: nextCompleted,
      });
    } else if (requeueQueue.length > 0) {
      // Re-append failed exercises for repeat attempt
      const newExercises = [...exercises, ...requeueQueue];
      set({
        exercises: newExercises,
        currentIndex: currentIndex + 1,
        requeueQueue: [],
        selectedAnswer: null,
        selectedWords: [],
        status: "idle",
        feedback: null,
        completedCount: nextCompleted,
      });
    } else {
      // Lesson complete
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
          completedCount: nextCompleted,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to complete lesson";
        set({ error: msg, status: "completed" });
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
      requeueQueue: [],
      completionResult: null,
    });
  },
}));
