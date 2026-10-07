export interface StrippedOption {
  id: number;
  text: string;
  pair_key?: string | null;
  side?: string | null;
  position: number;
}

export interface StrippedExercise {
  id: number;
  lesson_id: number;
  position: number;
  type: string;
  prompt: string;
  source_text: string;
  image_key?: string | null;
  options: StrippedOption[];
}

export interface LessonStartResponse {
  attempt_id: number;
  lesson_id: number;
  lesson_title: string;
  is_practice: boolean;
  mode?: string;
  is_legendary?: boolean;
  time_limit_seconds?: number;
  max_strikes?: number;
  exercises: StrippedExercise[];
}

export interface AnswerFeedbackResponse {
  correct: boolean;
  solution: string;
  accent_warning: boolean;
  hearts: number;
  out_of_hearts: boolean;
}

export interface AttemptCompleteResponse {
  attempt_id: number;
  status: string;
  xp_earned: number;
  mistakes: number;
  total_xp: number;
  streak: number;
  hearts: number;
  gems: number;
  lessons_completed: number;
  skill_completed: boolean;
  is_legendary?: boolean;
}
