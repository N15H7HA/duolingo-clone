"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  BookOpen,
  Trophy,
  Target,
  ShoppingBag,
  User as UserIcon,
  Settings as SettingsIcon,
  FastForward,
  RotateCcw,
} from "lucide-react";
import { useAdvanceDay, useResetDemo } from "@/hooks/useDuolingo";

const navItems = [
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Quests", href: "/quests", icon: Target },
  { label: "Shop", href: "/shop", icon: ShoppingBag },
  { label: "Profile", href: "/profile", icon: UserIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const advanceDay = useAdvanceDay();
  const resetDemo = useResetDemo();

  return (
    <>
      {/* Desktop / Tablet Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r-2 border-swan bg-snow h-screen sticky top-0 px-4 py-6 justify-between select-none">
        <div>
          {/* Duolingo Brand Wordmark */}
          <Link href="/learn" className="flex items-center gap-2.5 px-3 py-2 mb-6 group">
            <span className="text-3xl filter drop-shadow">🦉</span>
            <span className="font-extrabold text-2xl tracking-tight text-featherGreen group-hover:brightness-105 transition">
              duolingo
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === "/learn" && pathname === "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all duration-100",
                    isActive
                      ? "bg-selectedCardBg text-macaw border-2 border-macaw/30"
                      : "text-wolf hover:bg-polar hover:text-eel"
                  )}
                >
                  <Icon className={clsx("w-6 h-6", isActive ? "stroke-macaw" : "stroke-wolf")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Developer Sandbox Controls */}
        <div className="p-3.5 bg-polar rounded-2xl border-2 border-swan space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-wolf">
            Developer Controls
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => advanceDay.mutate()}
              disabled={advanceDay.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-snow border border-swan rounded-xl text-xs font-extrabold text-eel hover:bg-polar active:scale-95 transition shadow-sm"
              title="Advance time by +1 day"
            >
              <FastForward className="w-3.5 h-3.5 text-fox" />
              <span>+1 Day</span>
            </button>
            <button
              onClick={() => resetDemo.mutate()}
              disabled={resetDemo.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-snow border border-swan rounded-xl text-xs font-extrabold text-cardinal hover:bg-feedbackRedBg active:scale-95 transition shadow-sm"
              title="Reset to clean demo seed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-snow border-t-2 border-swan px-4 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/learn" && pathname === "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center p-2 rounded-xl transition",
                isActive ? "text-macaw" : "text-wolf"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-extrabold uppercase mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
