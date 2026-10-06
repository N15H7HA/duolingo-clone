"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Zap, Flame, Shield, Award, CheckCircle2 } from "lucide-react";
import { AttemptCompleteResponse } from "@/types";
import Button3D from "@/components/ui/Button3D";

interface LessonCelebrationProps {
  result: AttemptCompleteResponse | null;
  lessonTitle: string;
}

export default function LessonCelebration({
  result,
  lessonTitle,
}: LessonCelebrationProps) {
  const router = useRouter();

  const xp = result?.xp_earned || 15;
  const streak = result?.streak || 3;
  const mistakes = result?.mistakes || 0;

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-snow px-4 py-8 select-none">
      <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Animated Celebration Badge */}
        <div className="relative w-28 h-28 mx-auto">
          <div className="w-28 h-28 rounded-full bg-bee/20 border-4 border-bee flex items-center justify-center text-6xl shadow-xl animate-bounce">
            🏆
          </div>
          <div className="absolute -bottom-2 right-0 bg-featherGreen text-snow p-1.5 rounded-full border-2 border-snow shadow">
            <CheckCircle2 className="w-6 h-6 fill-featherGreen stroke-snow" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-bee tracking-tight">
            Lesson Complete!
          </h1>
          <p className="text-wolf font-extrabold text-sm sm:text-base mt-1">
            {lessonTitle || "Spanish Fundamentals"}
          </p>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* XP Card */}
          <div className="p-4 bg-polar rounded-3xl border-2 border-swan text-center space-y-1 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-bee/10 mx-auto flex items-center justify-center">
              <Zap className="w-5 h-5 text-bee fill-bee" />
            </div>
            <p className="text-xs font-black uppercase text-wolf">Total XP</p>
            <p className="text-2xl font-black text-bee">+{xp} XP</p>
          </div>

          {/* Streak Card */}
          <div className="p-4 bg-polar rounded-3xl border-2 border-swan text-center space-y-1 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-feedbackRedBg mx-auto flex items-center justify-center">
              <Flame className="w-5 h-5 text-fox fill-fox" />
            </div>
            <p className="text-xs font-black uppercase text-wolf">Streak</p>
            <p className="text-2xl font-black text-fox">{streak} Days</p>
          </div>
        </div>

        {/* Skill Mastery Notice if finished */}
        {result?.skill_completed && (
          <div className="p-4 bg-feedbackGreenBg rounded-2xl border-2 border-featherGreenShadow text-center animate-in slide-in-from-bottom duration-300">
            <p className="text-sm font-black text-featherGreen">
              🎉 Skill Mastered! +50 Bonus Gems Awarded!
            </p>
          </div>
        )}

        {/* Continue Action */}
        <div className="pt-2">
          <Button3D
            variant="green"
            fullWidth
            size="lg"
            onClick={() => router.push("/learn")}
          >
            Continue
          </Button3D>
        </div>
      </div>
    </div>
  );
}
