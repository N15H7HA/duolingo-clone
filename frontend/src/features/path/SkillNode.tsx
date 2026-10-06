"use client";

import React, { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Check, Lock, Star, Sparkles, BookOpen, Coffee, Apple, MessageCircle, Utensils, Users } from "lucide-react";
import { SkillNode as SkillNodeType } from "@/hooks/useDuolingo";
import Button3D from "@/components/ui/Button3D";

interface SkillNodeProps {
  skill: SkillNodeType;
  unitColor: string;
  horizontalOffset: number;
}

export default function SkillNode({ skill, unitColor, horizontalOffset }: SkillNodeProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Icon mapping helper
  const renderIcon = () => {
    if (skill.status === "locked") {
      return <Lock className="w-8 h-8 text-hare stroke-[2.5]" />;
    }
    if (skill.status === "completed") {
      return <Check className="w-9 h-9 text-snow stroke-[3.5]" />;
    }

    // Active icons based on icon key
    switch (skill.icon) {
      case "coffee":
        return <Coffee className="w-8 h-8 text-snow stroke-[2.5]" />;
      case "apple":
        return <Apple className="w-8 h-8 text-snow stroke-[2.5]" />;
      case "chat":
        return <MessageCircle className="w-8 h-8 text-snow stroke-[2.5]" />;
      case "fork_knife":
        return <Utensils className="w-8 h-8 text-snow stroke-[2.5]" />;
      case "family_tree":
        return <Users className="w-8 h-8 text-snow stroke-[2.5]" />;
      default:
        return <Star className="w-8 h-8 fill-snow text-snow stroke-[2.5]" />;
    }
  };

  // Find next uncompleted lesson id or fallback
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

  return (
    <div
      className={clsx(
        "relative flex flex-col items-center select-none transition-transform duration-300",
        isPopoverOpen ? "z-40" : "z-10"
      )}
      style={{ transform: `translateX(${horizontalOffset}px)` }}
    >
      {/* Bouncing START Speech Bubble on Active Node (hidden when popover is open) */}
      {skill.status === "active" && !isPopoverOpen && (
        <div className="absolute -top-11 z-20 animate-bounce-subtle pointer-events-none">
          <div className="bg-snow text-featherGreen px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider border-2 border-swan shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-featherGreen" />
            <span>Start</span>
          </div>
          {/* Tooltip triangle pointer */}
          <div className="w-2.5 h-2.5 bg-snow border-r-2 border-b-2 border-swan transform rotate-45 mx-auto -mt-1.5" />
        </div>
      )}

      {/* Main Circular Skill Button Wrapper with optional Progress Ring */}
      <div className="relative flex items-center justify-center">
        {/* Progress Ring for active node */}
        {skill.status === "active" && (
          <svg className="absolute -inset-2 w-24 h-24 -rotate-90 pointer-events-none">
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="#E5E5E5"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="#FFC800"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - (skill.progress_ratio || 0))}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
        )}

        <button
          onClick={() => isClickable && setIsPopoverOpen(!isPopoverOpen)}
          disabled={skill.status === "locked"}
          aria-label={`${skill.name} - ${skill.status}`}
          style={{
            backgroundColor:
              skill.status === "completed"
                ? "#FFC800"
                : skill.status === "active"
                ? unitColor
                : "#E5E5E5",
            borderColor:
              skill.status === "completed"
                ? "#E5B200"
                : skill.status === "active"
                ? "#46A302"
                : "#CECECE",
          }}
          className={clsx(
            "relative w-20 h-20 rounded-full flex items-center justify-center border-b-[6px] transition-all active:translate-y-[3px] active:border-b-[3px] focus:outline-none shadow-sm",
            isClickable ? "cursor-pointer hover:brightness-105" : "cursor-not-allowed opacity-90",
            skill.status === "active" ? "ring-4 ring-featherGreen/20" : ""
          )}
        >
          {renderIcon()}
        </button>
      </div>

      {/* Floating Popover on Click */}
      {isPopoverOpen && (
        <>
          {/* Transparent Backdrop to dismiss popover when clicking outside */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsPopoverOpen(false)}
          />

          {/* Popover Card anchored cleanly below the node */}
          <div className="absolute top-[96px] z-40 w-72 sm:w-80 bg-snow rounded-3xl p-5 border-2 border-swan shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Top pointer arrow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-snow border-t-2 border-l-2 border-swan transform rotate-45" />

            <div className="relative text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-wolf tracking-wider">
                  {skill.status === "completed" ? "Completed Skill" : "Active Skill"}
                </span>
                <span className="text-xs font-black text-fox">
                  Lesson {skill.lessons_completed + (skill.status === "completed" ? 0 : 1)} of {skill.lesson_count}
                </span>
              </div>

              <div>
                <h4 className="text-xl font-black text-eel">{skill.name}</h4>
                <p className="text-xs font-bold text-wolf mt-0.5">
                  {skill.status === "completed"
                    ? "Practice this skill to refresh vocabulary"
                    : currentLessonTitle}
                </p>
              </div>

              <Link href={`/lesson/${lessonIdToLaunch}`} className="block pt-1">
                <Button3D variant="green" fullWidth size="md">
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
