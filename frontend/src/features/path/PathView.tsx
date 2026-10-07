"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePath } from "@/hooks/useDuolingo";
import UnitHeader from "./UnitHeader";
import SkillNode from "./SkillNode";

const SINE_DESKTOP_OFFSETS = [0, 45, 75, 45, 0, -45, -75, -45];
const SINE_MOBILE_OFFSETS = [0, 25, 45, 25, 0, -25, -45, -25];

export default function PathView() {
  const { data: pathData, isLoading, error } = usePath();
  const [activeSkillId, setActiveSkillId] = useState<number | string | null>(null);

  // Close active popover on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveSkillId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggle = useCallback((id: number | string) => {
    setActiveSkillId((prev) => (prev === id ? null : id));
  }, []);

  const handleClose = useCallback(() => {
    setActiveSkillId(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 space-y-8 max-w-[592px] mx-auto w-full">
        <div className="w-full h-28 bg-[#E5E5E5] dark:bg-[#263843] rounded-2xl animate-pulse" />
        <div className="w-20 h-20 bg-[#E5E5E5] dark:bg-[#263843] rounded-full animate-pulse my-4" />
        <div className="w-20 h-20 bg-[#E5E5E5] dark:bg-[#263843] rounded-full animate-pulse my-4 translate-x-6 sm:translate-x-11" />
        <div className="w-20 h-20 bg-[#E5E5E5] dark:bg-[#263843] rounded-full animate-pulse my-4 translate-x-10 sm:translate-x-18" />
      </div>
    );
  }

  if (error || !pathData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-[592px] mx-auto w-full">
        <p className="text-[#FF4B4B] font-black text-lg mb-2">Failed to load learning path</p>
        <p className="text-[#777777] dark:text-[#8598A3] text-sm font-bold">
          Please ensure the backend server is running on http://localhost:8000
        </p>
      </div>
    );
  }

  // Global skill index across all units to maintain a continuous, graceful sine wave
  let globalSkillIndex = 0;

  return (
    <div className="w-full max-w-[592px] mx-auto px-4 pb-24 md:pb-12 flex flex-col items-center select-none pt-4 relative">
      {/* Global Transparent Backdrop to dismiss any open popover on click */}
      {activeSkillId !== null && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {pathData.units.map((unit, unitIdx) => {
        return (
          <section key={unit.id} className="w-full flex flex-col items-center mb-12 sm:mb-16">
            {/* Unit Title Banner: SECTION 1, UNIT X */}
            <UnitHeader
              position={unit.position}
              title={unit.title}
              description={unit.description}
              color={unit.color || "#58CC02"}
              sectionNumber={1}
            />

            {/* Path Skill Nodes with Sine-Wave Horizontal Offset */}
            <div className="flex flex-col items-center w-full">
              {unit.skills.map((skill, sIdx) => {
                const offsetIndex = globalSkillIndex % SINE_DESKTOP_OFFSETS.length;
                const desktopOffset = SINE_DESKTOP_OFFSETS[offsetIndex];
                const mobileOffset = SINE_MOBILE_OFFSETS[offsetIndex];
                globalSkillIndex += 1;

                const chestId = `chest-${unit.id}-${skill.id}`;

                return (
                  <React.Fragment key={skill.id}>
                    <SkillNode
                      skill={skill}
                      unitColor={unit.color || "#58CC02"}
                      horizontalOffset={desktopOffset}
                      mobileOffset={mobileOffset}
                      isOpen={activeSkillId === skill.id}
                      onToggle={() => handleToggle(skill.id)}
                      onClose={handleClose}
                      nodeType="skill"
                    />

                    {/* Intermediate Chest node if at middle of skill list */}
                    {sIdx === Math.floor(unit.skills.length / 2) && unit.skills.length > 2 && (
                      <SkillNode
                        skill={{
                          id: 9900 + unit.id,
                          name: "Unit Reward Chest",
                          icon: "chest",
                          status: skill.status === "completed" ? "completed" : "locked",
                          lesson_count: 1,
                          lessons_completed: skill.status === "completed" ? 1 : 0,
                          progress_ratio: skill.status === "completed" ? 1 : 0,
                        }}
                        unitColor={unit.color || "#58CC02"}
                        horizontalOffset={SINE_DESKTOP_OFFSETS[globalSkillIndex % SINE_DESKTOP_OFFSETS.length]}
                        mobileOffset={SINE_MOBILE_OFFSETS[(globalSkillIndex++) % SINE_MOBILE_OFFSETS.length]}
                        isOpen={activeSkillId === chestId}
                        onToggle={() => handleToggle(chestId)}
                        onClose={handleClose}
                        nodeType="chest"
                      />
                    )}
                  </React.Fragment>
                );
              })}

              {/* End of Unit Trophy Node */}
              {unit.skills.every((s) => s.status === "completed") && (
                <SkillNode
                  skill={{
                    id: 9990 + unit.id,
                    name: `Unit ${unit.position} Mastery Trophy`,
                    icon: "trophy",
                    status: "completed",
                    lesson_count: 1,
                    lessons_completed: 1,
                    progress_ratio: 1,
                  }}
                  unitColor="#FFC800"
                  horizontalOffset={0}
                  mobileOffset={0}
                  isOpen={activeSkillId === `trophy-${unit.id}`}
                  onToggle={() => handleToggle(`trophy-${unit.id}`)}
                  onClose={handleClose}
                  nodeType="trophy"
                />
              )}
            </div>

            {/* Visual spacer before next unit */}
            {unitIdx < pathData.units.length - 1 && <div className="h-4 sm:h-6" />}
          </section>
        );
      })}
    </div>
  );
}
