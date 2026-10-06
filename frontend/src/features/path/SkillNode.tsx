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

  // Find next uncompleted lesson id or first lesson
  const currentLesson =
    skill.lessons.find((l) => !l.is_completed) || skill.lessons[0] || { id: 1, position: 1, title: "Lesson 1" };

  const isClickable = skill.status === "active" || skill.status === "completed";

  return (
    <div
      className="relative flex flex-col items-center my-3 select-none"
      style={{ transform: `translateX(${horizontalOffset}px)` }}
    >
      {/* Bouncing START Speech Bubble on Active Node */}
      {skill.status === "active" && (
        <div className="absolute -top-10 z-20 animate-bounce-subtle pointer-events-none">
          <div className="bg-snow text-featherGreen px-3.5 py-1 rounded-xl font-black text-xs uppercase tracking-wider border-2 border-swan shadow-md flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-featherGreen" />
            <span>Start</span>
          </div>
          {/* Tooltip triangle */}
          <div className="w-2.5 h-2.5 bg-snow border-r-2 border-b-2 border-swan transform rotate-45 mx-auto -mt-1.5" />
        </div>
      )}

      {/* Main Circular Skill Button */}
      <button
        onClick={() => isClickable && setIsPopoverOpen(!isPopoverOpen)}
        disabled={skill.status === "locked"}
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
          "relative w-20 h-20 rounded-full flex items-center justify-center border-b-[6px] transition-transform active:translate-y-[3px] active:border-b-[3px] focus:outline-none shadow-sm",
          isClickable ? "cursor-pointer hover:brightness-105" : "cursor-not-allowed opacity-90",
          skill.status === "active" ? "ring-8 ring-featherGreen/20" : ""
        )}
      >
        {renderIcon()}
      </button>

      {/* Floating Popover on Click */}
      {isPopoverOpen && (
        <>
          {/* Overlay to close popover */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsPopoverOpen(false)}
          />

          {/* Popover Card */}
          <div className="absolute top-24 z-40 w-72 bg-snow rounded-3xl p-5 border-2 border-swan shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="text-left space-y-3">
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
                    : currentLesson.title || "Master Spanish phrases and words"}
                </p>
              </div>

              <Link href={`/lesson/${currentLesson.id}`} className="block pt-1">
                <Button3D variant="green" fullWidth size="md">
                  {skill.status === "completed" ? "Practice +5 XP" : "Start +10 XP"}
                </Button3D>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
