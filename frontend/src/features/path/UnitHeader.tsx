"use client";

import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import Button3D from "@/components/ui/Button3D";
import GuidebookModal from "./GuidebookModal";

interface UnitHeaderProps {
  position: number;
  title: string;
  description: string;
  color?: string;
  sectionNumber?: number;
}

export default function UnitHeader({
  position,
  title,
  description,
  color = "#58CC02",
  sectionNumber = 1,
}: UnitHeaderProps) {
  const [isGuidebookOpen, setIsGuidebookOpen] = useState(false);

  return (
    <>
      <div
        style={{ backgroundColor: color }}
        className="w-full text-white rounded-2xl p-6 mb-8 shadow-sm flex items-center justify-between border-b-4 border-black/15 select-none transition-all"
      >
        <div className="space-y-1.5 pr-4">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
            SECTION {sectionNumber}, UNIT {position} — {title}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-white/95 max-w-md line-clamp-2">
            {description}
          </p>
        </div>

        <div className="shrink-0">
          <Button3D
            variant="white"
            size="sm"
            onClick={() => setIsGuidebookOpen(true)}
            className="flex items-center gap-2 text-[#58CC02] font-black"
          >
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Guidebook</span>
          </Button3D>
        </div>
      </div>

      {/* Interactive Guidebook Modal */}
      <GuidebookModal
        isOpen={isGuidebookOpen}
        onClose={() => setIsGuidebookOpen(false)}
        unit={{
          unitPosition: position,
          unitTitle: title,
          unitDescription: description,
          unitColor: color,
        }}
      />
    </>
  );
}
