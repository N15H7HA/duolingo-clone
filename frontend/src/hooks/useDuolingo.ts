import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";

export interface UserProfile {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  timezone: string;
  xp_total: number;
  streak: number;
  hearts: number;
  next_heart_in_seconds: number;
  gems: number;
  daily_goal_xp: number;
  daily_xp_today: number;
  goal_completed: boolean;
  goal_percentage: number;
  sound_enabled: boolean;
  dark_mode: boolean;
  simulated_day_offset: number;
}

export interface LessonSummary {
  id: number;
  skill_id: number;
  position: number;
  title: string;
  is_completed: boolean;
}

export interface SkillNode {
  id: number;
  unit_id: number;
  position: number;
  name: string;
  icon: string;
  lesson_count: number;
  lessons_completed: number;
  current_lesson_id?: number;
  progress_percentage: number;
  progress_ratio: number;
  status: "completed" | "active" | "locked";
  lessons: LessonSummary[];
}

export interface UnitSection {
  id: number;
  course_id: number;
  position: number;
  title: string;
  description: string;
  color: string;
  skills: SkillNode[];
}

export interface PathData {
  course: {
    id: number;
    code: string;
    name: string;
    flag: string;
  };
  units: UnitSection[];
}

export interface LeaderboardEntry {
  user_id: number;
  username: string;
  display_name: string;
  avatar: string;
  weekly_xp: number;
  rank: number;
  is_current_user: boolean;
}

export interface LeaderboardData {
  league_id: number;
  league_name: string;
  league_tier: number;
  entries: LeaderboardEntry[];
}

export function useMe() {
  return useQuery<UserProfile>({
    queryKey: ["user-me"],
    queryFn: () => fetchApi<UserProfile>("/me"),
  });
}

export function usePath() {
  return useQuery<PathData>({
    queryKey: ["learning-path"],
    queryFn: () => fetchApi<PathData>("/path"),
  });
}

export function useLeaderboard() {
  return useQuery<LeaderboardData>({
    queryKey: ["league-leaderboard"],
    queryFn: () => fetchApi<LeaderboardData>("/leaderboard"),
  });
}

export function useHeartRefill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchApi<{ success: boolean; hearts: number; gems: number }>("/hearts/refill", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
    },
  });
}

export function useAdvanceDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchApi<{ success: boolean; simulated_day_offset: number }>("/dev/advance-day", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
      queryClient.invalidateQueries({ queryKey: ["learning-path"] });
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: { daily_goal_xp?: number; sound_enabled?: boolean; dark_mode?: boolean }) =>
      fetchApi<UserProfile>("/me/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      }),
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: ["user-me"] });
      const previousUser = queryClient.getQueryData<UserProfile>(["user-me"]);

      if (previousUser) {
        queryClient.setQueryData<UserProfile>(["user-me"], {
          ...previousUser,
          ...newSettings,
        });
      }

      if (typeof newSettings.dark_mode === "boolean") {
        try {
          localStorage.setItem("duolingo_dark_mode", String(newSettings.dark_mode));
        } catch {
          // Ignore
        }
        if (newSettings.dark_mode) {
          document.documentElement.classList.add("dark");
          document.documentElement.setAttribute("data-theme", "dark");
          document.documentElement.style.colorScheme = "dark";
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.setAttribute("data-theme", "light");
          document.documentElement.style.colorScheme = "light";
        }
      }

      return { previousUser };
    },
    onError: (err, newSettings, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user-me"], context.previousUser);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
    },
  });
}

export function useResetDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchApi<{ success: boolean }>("/dev/reset", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
      queryClient.invalidateQueries({ queryKey: ["learning-path"] });
      queryClient.invalidateQueries({ queryKey: ["league-leaderboard"] });
    },
  });
}
