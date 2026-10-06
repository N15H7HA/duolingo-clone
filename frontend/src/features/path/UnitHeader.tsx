"use client";

import React from "react";
import { BookOpen } from "lucide-react";

interface UnitHeaderProps {
  position: number;
  title: string;
  description: string;
  color: string;
}

export default function UnitHeader({ position, title, description, color }: UnitHeaderProps) {
  return (
    <div
      style={{ backgroundColor: color }}
      className="w-full rounded-3xl p-5 sm:p-6 text-snow shadow-sm flex items-center justify-between my-6 border-b-4 border-black/15 transition-all select-none"
    >
      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-snow/90">
          Unit {position}
        </h3>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">{title}</h2>
        <p className="text-xs sm:text-sm font-bold text-snow/95 max-w-md line-clamp-2">
          {description}
        </p>
      </div>

      <button className="flex items-center gap-2 bg-snow/20 hover:bg-snow/30 active:scale-95 border-2 border-snow/30 rounded-2xl px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition">
        <BookOpen className="w-4 h-4 stroke-[2.5]" />
        <span className="hidden sm:inline">Guidebook</span>
      </button>
    </div>
  );
}
