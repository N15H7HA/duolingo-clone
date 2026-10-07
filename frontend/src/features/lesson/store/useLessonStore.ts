import { create } from "zustand";
import { fetchApi } from "@/lib/api";
import {
  StrippedExercise,
  LessonStartResponse,
  AnswerFeedbackResponse,
  AttemptCompleteResponse,
} from "@/types";
import { playSound } from "@/lib/sound";

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
  startLesson: (lessonId: number | string, isPractice?: boolean, practiceType?: "mistakes" | "standard") => Promise<void>;
  selectOption: (val: string) => void;
  addWordTile: (word: string) => void;
  removeWordTile: (index: number) => void;
  removeLastWordTile: () => void;
  submitAnswer: () => Promise<void>;
  nextExercise: () => Promise<void>;
  abandonLesson: () => void;
}

const CORRECT_CHEERS = ["Amazing!", "Nicely done!", "Great job!", "Superb!", "Spot on!"];

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

  startLesson: async (lessonId: number | string, isPractice = false, practiceType?: "mistakes" | "standard") => {
    const isMistakesMode = lessonId === "mistakes" || lessonId === "practice-mistakes" || practiceType === "mistakes";
    const isPracticeMode = isPractice || isMistakesMode || lessonId === "practice";

    console.log(
      `[LessonStore] Starting lesson session (ID: ${lessonId}, isPractice: ${isPracticeMode}, type: ${practiceType || (isMistakesMode ? "mistakes" : "standard")})`
    );
    set({ isLoading: true, error: null, heartLostTrigger: false });
    try {
      const endpoint = isMistakesMode
        ? "/practice/mistakes/start"
        : isPracticeMode
        ? "/practice/start"
        : `/lessons/${lessonId}/start`;

      const data = await fetchApi<LessonStartResponse>(endpoint, {
        method: "POST",
      });

      console.log(
        `[LessonStore] Lesson initialized successfully: Attempt #${data.attempt_id}, Title: "${data.lesson_title}", Exercises: ${data.exercises.length}`
      );

      set({
        attemptId: data.attempt_id,
        lessonId: typeof lessonId === "number" ? lessonId : data.lesson_id,
        lessonTitle: data.lesson_title,
        isPractice: data.is_practice || isPracticeMode,
        exercises: data.exercises,
        currentIndex: 0,
        selectedAnswer: null,
        selectedWords: [],
        status: "idle",
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
    playSound("tap", 0.35);
    set({ selectedAnswer: val });
  },

  addWordTile: (word: string) => {
    if (get().status === "correct" || get().status === "incorrect") return;
    playSound("tap", 0.35);
    const newWords = [...get().selectedWords, word];
    set({
      selectedWords: newWords,
      selectedAnswer: newWords.join(" "),
    });
  },

  removeWordTile: (index: number) => {
    if (get().status === "correct" || get().status === "incorrect") return;
    playSound("tap", 0.35);
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
    playSound("tap", 0.35);
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
        playSound("correct");
        const newUnique = uniqueCorrectIds.includes(currentExercise.id)
          ? uniqueCorrectIds
          : [...uniqueCorrectIds, currentExercise.id];

        const randomCheer = CORRECT_CHEERS[Math.floor(Math.random() * CORRECT_CHEERS.length)];

        set({
          status: "correct",
          hearts: fb.hearts,
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
        playSound("incorrect");
        // Persistent Retry Queue (Spaced Repetition Loop):
        // Append failed exercise to the end of the exercises queue
        const updatedExercises = [...exercises, currentExercise];

        set({
          status: fb.out_of_hearts && !get().isPractice ? "out_of_hearts" : "incorrect",
          hearts: fb.hearts,
          heartLostTrigger: !get().isPractice,
          exercises: updatedExercises,
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
    const { attemptId, exercises, currentIndex, startTime, completedCount } = get();

    if (currentIndex + 1 < exercises.length) {
      set({
        currentIndex: currentIndex + 1,
        selectedAnswer: null,
        selectedWords: [],
        status: "idle",
        feedback: null,
        heartLostTrigger: false,
      });
    } else {
      // Lesson complete
      playSound("complete");
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
      heartLostTrigger: false,
      completionResult: null,
    });
  },
}));
