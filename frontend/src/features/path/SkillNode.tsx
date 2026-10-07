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
    lesson_count: number;
    lessons_completed: number;
    progress_percentage?: number;
    progress_ratio?: number;
    current_lesson_id?: number;
    lessons?: Array<{ id: number; title: string; is_completed: boolean; xp_reward: number }>;
  };
  unitColor?: string;
  horizontalOffset: number;
}

export default function SkillNode({
  skill,
  unitColor = "#58CC02",
  horizontalOffset,
}: SkillNodeProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Icon mapping helper
  const renderIcon = () => {
    if (skill.status === "locked") {
      return <Lock className="w-8 h-8 text-[#AFAFAF] dark:text-[#8598A3] stroke-[2.5]" />;
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

  const buttonStyle = {
    completed:
      "bg-[#FFC800] border-[#E5A500] text-white hover:brightness-105 active:translate-y-[2px] active:border-b-[4px]",
    active:
      "bg-[#58CC02] border-[#58A700] text-white hover:brightness-105 active:translate-y-[2px] active:border-b-[4px] ring-4 ring-[#58CC02]/20",
    locked:
      "bg-[#E5E5E5] dark:bg-[#37464F] border-[#E5E5E5] dark:border-[#37464F] text-[#AFAFAF] dark:text-[#8598A3] cursor-not-allowed",
  }[skill.status];

  return (
    <div
      className={clsx(
        "h-24 my-4 flex justify-center items-center relative select-none transition-transform duration-300 will-change-transform",
        isPopoverOpen ? "z-40" : "z-10"
      )}
      style={{ transform: `translateX(${horizontalOffset}px)` }}
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

        <button
          onClick={() => isClickable && setIsPopoverOpen(!isPopoverOpen)}
          disabled={skill.status === "locked"}
          aria-label={`${skill.name} - ${skill.status}`}
          className={clsx(
            "w-20 h-20 rounded-full border-b-[6px] flex items-center justify-center font-extrabold text-2xl relative transition-all duration-75 shadow-sm focus:outline-none",
            buttonStyle
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
          <div className="absolute top-[96px] z-40 w-72 sm:w-80 bg-white dark:bg-[#18272F] rounded-3xl p-5 border-2 border-[#E5E5E5] dark:border-[#263843] border-b-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Top pointer arrow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#18272F] border-t-2 border-l-2 border-[#E5E5E5] dark:border-[#263843] transform rotate-45" />

            <div className="relative text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#777777] dark:text-[#8598A3] tracking-wider">
                  {skill.status === "completed" ? "Completed Skill" : "Active Skill"}
                </span>
                <span className="text-xs font-black text-[#FF9600]">
                  Lesson {skill.lessons_completed + (skill.status === "completed" ? 0 : 1)} of {skill.lesson_count}
                </span>
              </div>

              <div>
                <h4 className="text-xl font-black text-[#4B4B4B] dark:text-white">{skill.name}</h4>
                <p className="text-xs font-bold text-[#777777] dark:text-[#8598A3] mt-0.5">
                  {skill.status === "completed"
                    ? "Practice this skill to refresh vocabulary"
                    : currentLessonTitle}
                </p>
              </div>

              <Link href={`/lesson/${lessonIdToLaunch}`} className="block pt-1">
                <Button3D
                  variant={skill.status === "completed" ? "gold" : "green"}
                  fullWidth
                  size="md"
                >
                  {skill.status === "completed" ? "PRACTICE +5 XP" : "START +10 XP"}
                </Button3D>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
