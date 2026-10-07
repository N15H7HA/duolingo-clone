"use client";

import React, { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  Check,
  Lock,
  Star,
  Sparkles,
  Coffee,
  Apple,
  MessageCircle,
  Utensils,
  Users,
  Trophy,
  Gift,
  Crown,
  Zap,
} from "lucide-react";
import { SkillNode as SkillNodeType } from "@/hooks/useDuolingo";
import Button3D from "@/components/ui/Button3D";

interface SkillNodeProps {
  skill: SkillNodeType | {
    id: number;
    unit_id?: number;
    name: string;
    icon: string;
    position?: number;
    status: "locked" | "active" | "completed";
    is_legendary?: boolean;
    lesson_count: number;
    lessons_completed: number;
    progress_percentage?: number;
    progress_ratio?: number;
    current_lesson_id?: number;
    lessons?: Array<{ id: number; title: string; is_completed: boolean; xp_reward: number }>;
  };
  unitColor?: string;
  horizontalOffset: number;
  mobileOffset?: number;
}

export default function SkillNode({
  skill,
  unitColor = "#58CC02",
  horizontalOffset,
  mobileOffset,
}: SkillNodeProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const isLegendary = Boolean(skill.is_legendary);
  const mobOffset = mobileOffset ?? Math.round(horizontalOffset * 0.6);

  // Icon mapping helper
  const renderIcon = () => {
    if (skill.status === "locked") {
      return <Lock className="w-8 h-8 text-[#AFAFAF] dark:text-[#8598A3] stroke-[2.5]" />;
    }
    if (isLegendary) {
      return <Crown className="w-9 h-9 text-amber-300 fill-amber-300 drop-shadow-md stroke-[2.5]" />;
    }
    if (skill.status === "completed") {
      return <Check className="w-9 h-9 text-white stroke-[3.5]" />;
    }

    switch (skill.icon) {
      case "coffee":
        return <Coffee className="w-8 h-8 text-white stroke-[2.5]" />;
      case "apple":
        return <Apple className="w-8 h-8 text-white stroke-[2.5]" />;
      case "chat":
        return <MessageCircle className="w-8 h-8 text-white stroke-[2.5]" />;
      case "fork_knife":
        return <Utensils className="w-8 h-8 text-white stroke-[2.5]" />;
      case "family_tree":
        return <Users className="w-8 h-8 text-white stroke-[2.5]" />;
      case "chest":
        return <Gift className="w-8 h-8 text-white stroke-[2.5]" />;
      case "trophy":
        return <Trophy className="w-8 h-8 text-white stroke-[2.5]" />;
      default:
        return <Star className="w-8 h-8 fill-white text-white stroke-[2.5]" />;
    }
  };

  // Target lesson ID to launch
  const lessonIdToLaunch =
    skill.current_lesson_id ||
    skill.lessons?.find((l) => !l.is_completed)?.id ||
    skill.lessons?.[0]?.id ||
    skill.id ||
    1;

  const currentLessonTitle =
    skill.lessons?.find((l) => l.id === lessonIdToLaunch)?.title ||
    skill.lessons?.[0]?.title ||
    "Master Spanish phrases and words";

  const isClickable = skill.status === "active" || skill.status === "completed";

  let nodeButtonStyle = "";
  if (isLegendary) {
    nodeButtonStyle =
      "bg-[#8B5CF6] border-[#6D28D9] text-white hover:brightness-105 active:translate-y-[2px] active:border-b-[4px] ring-4 ring-[#FFC800]/50 shadow-[0_0_15px_rgba(255,200,0,0.3)]";
  } else if (skill.status === "completed") {
    nodeButtonStyle =
      "bg-[#FFC800] border-[#E5A500] text-white hover:brightness-105 active:translate-y-[2px] active:border-b-[4px]";
  } else if (skill.status === "active") {
    nodeButtonStyle =
      "bg-[#58CC02] border-[#58A700] text-white hover:brightness-105 active:translate-y-[2px] active:border-b-[4px] ring-4 ring-[#58CC02]/20";
  } else {
    nodeButtonStyle =
      "bg-[#E5E5E5] dark:bg-[#37464F] border-[#E5E5E5] dark:border-[#37464F] text-[#AFAFAF] dark:text-[#8598A3] cursor-not-allowed";
  }

  return (
    <div
      className={clsx(
        "h-24 my-4 flex justify-center items-center relative select-none transition-transform duration-300 will-change-transform translate-x-[var(--mob-x)] md:translate-x-[var(--desk-x)] touch-manipulation",
        isPopoverOpen ? "z-40" : "z-10"
      )}
      style={
        {
          "--mob-x": `${mobOffset}px`,
          "--desk-x": `${horizontalOffset}px`,
        } as React.CSSProperties
      }
    >
      {/* Floating Bouncing Speech Bubble on Active Node (-top-16) */}
      {skill.status === "active" && !isPopoverOpen && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-none">
          <div className="bg-white dark:bg-[#18272F] text-[#58CC02] px-4 py-1.5 rounded-2xl font-black text-xs uppercase tracking-wider border-2 border-[#E5E5E5] dark:border-[#263843] border-b-4 shadow-md flex items-center gap-1.5 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 fill-[#58CC02]" />
            <span>START</span>
          </div>
          {/* Pointer triangle */}
          <div className="w-2.5 h-2.5 bg-white dark:bg-[#18272F] border-r-2 border-b-2 border-[#E5E5E5] dark:border-[#263843] transform rotate-45 mx-auto -mt-1.5" />
        </div>
      )}

      {/* Main Circular Skill Button */}
      <div className="relative flex items-center justify-center">
        {/* Progress Ring for active node */}
        {skill.status === "active" && (
          <svg className="absolute -inset-2.5 w-[100px] h-[100px] -rotate-90 pointer-events-none">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-[#E5E5E5] dark:stroke-[#263843]"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#FFC800"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={2 * Math.PI * 45 * (1 - (skill.progress_ratio || 0))}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
        )}

        {/* Legendary Sparkles Overlay */}
        {isLegendary && (
          <div className="absolute -top-2 -right-2 z-20 pointer-events-none animate-pulse">
            <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow" />
          </div>
        )}

        <button
          onClick={() => isClickable && setIsPopoverOpen(!isPopoverOpen)}
          disabled={skill.status === "locked"}
          aria-label={`${skill.name} - ${isLegendary ? "Legendary Master" : skill.status}`}
          className={clsx(
            "w-20 h-20 rounded-full border-b-[6px] flex items-center justify-center font-extrabold text-2xl relative transition-all duration-75 shadow-sm focus:outline-none",
            nodeButtonStyle
          )}
        >
          {renderIcon()}
        </button>
      </div>

      {/* Floating Self-Contained Popover on Click */}
      {isPopoverOpen && (
        <>
          {/* Transparent Backdrop to dismiss popover when clicking outside */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsPopoverOpen(false)}
          />

          {/* Popover Card */}
          <div className="absolute top-[96px] z-40 w-72 sm:w-84 bg-white dark:bg-[#18272F] rounded-3xl p-5 border-2 border-[#E5E5E5] dark:border-[#263843] border-b-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Top pointer arrow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#18272F] border-t-2 border-l-2 border-[#E5E5E5] dark:border-[#263843] transform rotate-45" />

            <div className="relative text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className={clsx(
                  "text-xs font-black uppercase tracking-wider flex items-center gap-1",
                  isLegendary ? "text-purple-600 dark:text-purple-400" : "text-[#777777] dark:text-[#8598A3]"
                )}>
                  {isLegendary ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Level: Legendary Master</span>
                    </>
                  ) : skill.status === "completed" ? (
                    "Level: Legendary"
                  ) : (
                    "Active Skill"
                  )}
                </span>
                <span className="text-xs font-black text-[#FF9600]">
                  {skill.status === "completed"
                    ? `${skill.lesson_count}/${skill.lesson_count} Completed`
                    : `Lesson ${skill.lessons_completed + 1} of ${skill.lesson_count}`}
                </span>
              </div>

              <div>
                <h4 className="text-xl font-black text-[#4B4B4B] dark:text-white flex items-center justify-between">
                  <span>{skill.name}</span>
                  {isLegendary && <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />}
                </h4>
                <p className="text-xs font-bold text-[#777777] dark:text-[#8598A3] mt-0.5">
                  {isLegendary
                    ? "You mastered this skill at legendary level! Practice anytime."
                    : skill.status === "completed"
                    ? "Prove your mastery with no hints and earn 40 XP!"
                    : currentLessonTitle}
                </p>
              </div>

              {/* Action Buttons */}
              {skill.status === "completed" ? (
                <div className="space-y-2 pt-1">
                  {!isLegendary && (
                    <Link href={`/lesson/${lessonIdToLaunch}?mode=legendary`} className="block">
                      <Button3D
                        variant="purple"
                        fullWidth
                        size="md"
                        className="flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 border-b-[5px]"
                      >
                        <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                        <span>LEGENDARY (+40 XP)</span>
                      </Button3D>
                    </Link>
                  )}
                  <Link href={`/lesson/${lessonIdToLaunch}?mode=practice`} className="block">
                    <Button3D
                      variant="gold"
                      fullWidth
                      size="md"
                      className="flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>PRACTICE (+5 XP)</span>
                    </Button3D>
                  </Link>
                </div>
              ) : (
                <Link href={`/lesson/${lessonIdToLaunch}`} className="block pt-1">
                  <Button3D
                    variant="green"
                    fullWidth
                    size="md"
                  >
                    START (+10 XP)
                  </Button3D>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
