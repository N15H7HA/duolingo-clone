"use client";

import React from "react";
import { usePath } from "@/hooks/useDuolingo";
import UnitHeader from "./UnitHeader";
import SkillNode from "./SkillNode";

const SINE_OFFSETS = [0, 40, 70, 40, 0, -40, -70, -40];

export default function PathView() {
  const { data: pathData, isLoading, error } = usePath();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6 max-w-xl mx-auto">
        <div className="w-full h-28 bg-swan/50 rounded-3xl animate-pulse" />
        <div className="w-20 h-20 bg-swan/50 rounded-full animate-pulse my-4" />
        <div className="w-20 h-20 bg-swan/50 rounded-full animate-pulse my-4 translate-x-10" />
        <div className="w-20 h-20 bg-swan/50 rounded-full animate-pulse my-4 translate-x-16" />
      </div>
    );
  }

  if (error || !pathData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-cardinal font-black text-lg mb-2">Failed to load learning path</p>
        <p className="text-wolf text-sm">Please ensure the backend server is running on http://localhost:8000</p>
      </div>
    );
  }

  // Global skill index across all units to keep continuous smooth sine wave
  let globalSkillIndex = 0;

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto px-4 pb-28 pt-2">
      {pathData.units.map((unit) => {
        return (
          <section key={unit.id} className="w-full flex flex-col items-center mb-10">
            {/* Unit Title Banner */}
            <UnitHeader
              position={unit.position}
              title={unit.title}
              description={unit.description}
              color={unit.color || "#58CC02"}
            />

            {/* Path Skill Nodes with Sine-wave offset */}
            <div className="flex flex-col items-center py-4 w-full">
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
          </section>
        );
      })}
    </div>
  );
}
