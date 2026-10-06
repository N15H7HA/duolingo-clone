"use client";

import React from "react";
import { usePath } from "@/hooks/useDuolingo";
import UnitHeader from "./UnitHeader";
import SkillNode from "./SkillNode";

const SINE_OFFSETS = [0, 45, 75, 45, 0, -45, -75, -45];

export default function PathView() {
  const { data: pathData, isLoading, error } = usePath();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-8 max-w-[592px] mx-auto">
        <div className="w-full h-28 bg-[#E5E5E5]/60 rounded-2xl animate-pulse" />
        <div className="w-20 h-20 bg-[#E5E5E5]/60 rounded-full animate-pulse my-4" />
        <div className="w-20 h-20 bg-[#E5E5E5]/60 rounded-full animate-pulse my-4 translate-x-11" />
        <div className="w-20 h-20 bg-[#E5E5E5]/60 rounded-full animate-pulse my-4 translate-x-18" />
      </div>
    );
  }

  if (error || !pathData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-[592px] mx-auto">
        <p className="text-[#FF4B4B] font-black text-lg mb-2">Failed to load learning path</p>
        <p className="text-[#777777] text-sm">Please ensure the backend server is running on http://localhost:8000</p>
      </div>
    );
  }

  // Global skill index across all units to maintain a continuous, graceful sine wave
  let globalSkillIndex = 0;

  return (
    <div className="flex flex-col items-center max-w-[592px] mx-auto px-4 pb-24 pt-4">
      {pathData.units.map((unit, unitIdx) => {
        return (
          <section key={unit.id} className="w-full flex flex-col items-center mb-16">
            {/* Unit Title Banner */}
            <UnitHeader
              position={unit.position}
              title={unit.title}
              description={unit.description}
              color={unit.color || "#58CC02"}
            />

            {/* Path Skill Nodes with Sine-Wave Horizontal Offset */}
            <div className="flex flex-col items-center w-full">
              {unit.skills.map((skill) => {
                const offsetIndex = globalSkillIndex % SINE_OFFSETS.length;
                const offset = SINE_OFFSETS[offsetIndex];
                globalSkillIndex += 1;

                return (
                  <SkillNode
                    key={skill.id}
                    skill={skill}
                    unitColor={unit.color || "#58CC02"}
                    horizontalOffset={offset}
                  />
                );
              })}
            </div>

            {/* Visual spacer before next unit */}
            {unitIdx < pathData.units.length - 1 && <div className="h-6" />}
          </section>
        );
      })}
    </div>
  );
}
