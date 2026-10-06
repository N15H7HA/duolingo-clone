"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import Button3D from "@/components/ui/Button3D";

interface UnitHeaderProps {
  position: number;
  title: string;
  description: string;
  color?: string;
}

export default function UnitHeader({ position, title, description, color = "#58CC02" }: UnitHeaderProps) {
  return (
    <div
      style={{ backgroundColor: color }}
      className="w-full text-white rounded-2xl p-6 mb-12 shadow-sm flex items-center justify-between border-b-4 border-black/15 select-none transition-all"
    >
      <div className="space-y-1 pr-4">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white/90">
          Unit {position}
        </h3>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">{title}</h2>
        <p className="text-xs sm:text-sm font-bold text-white/95 max-w-md line-clamp-2">
          {description}
        </p>
      </div>

      <div className="shrink-0">
        <Button3D variant="white" size="sm" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 stroke-[2.5]" />
          <span>Guidebook</span>
        </Button3D>
      </div>
    </div>
  );
}
