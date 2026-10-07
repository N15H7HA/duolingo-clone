"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  BookOpen,
  Dumbbell,
  Trophy,
  Target,
  ShoppingBag,
  User as UserIcon,
  MoreHorizontal,
  Crown,
} from "lucide-react";
import Button3D from "../ui/Button3D";

const navItems = [
  { label: "LEARN", href: "/learn", icon: BookOpen },
  { label: "PRACTICE", href: "/practice", icon: Dumbbell },
  { label: "LEADERBOARDS", href: "/leaderboard", icon: Trophy },
  { label: "QUESTS", href: "/quests", icon: Target },
  { label: "SHOP", href: "/shop", icon: ShoppingBag },
  { label: "PROFILE", href: "/profile", icon: UserIcon },
  { label: "MORE", href: "/settings", icon: MoreHorizontal },
];

const mobileNavItems = [
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Practice", href: "/practice", icon: Dumbbell },
  { label: "Ranks", href: "/leaderboard", icon: Trophy },
  { label: "Quests", href: "/quests", icon: Target },
  { label: "Profile", href: "/profile", icon: UserIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop (>=1024px: w-64) & Tablet (768px-1023px: w-20 icon rail) Left Sidebar */}
      <aside className="hidden md:flex flex-col md:w-20 lg:w-64 border-r-2 border-[#E5E5E5] dark:border-[#263843] bg-white dark:bg-[#131F24] h-screen sticky top-0 px-3 lg:px-4 py-6 justify-between select-none shrink-0 z-30 transition-all duration-200">
        <div className="flex flex-col items-center lg:items-stretch">
          {/* Green Duolingo Wordmark */}
          <Link
            href="/learn"
            className="flex items-center gap-2.5 px-2 lg:px-3 py-2 mb-6 group justify-center lg:justify-start"
            title="Duolingo"
          >
            <span className="text-3xl filter drop-shadow">🦉</span>
            <span className="hidden lg:inline font-extrabold text-2xl tracking-tight text-[#58CC02] group-hover:brightness-105 transition">
              duolingo
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === "/learn" && pathname === "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={clsx(
                    "flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all duration-100",
                    isActive
                      ? "bg-[#DDF4FF] dark:bg-[#18272F] border-2 border-[#84D8FF] dark:border-[#1CB0F6] text-[#1CB0F6]"
                      : "text-[#777777] dark:text-[#8598A3] hover:bg-[#F7F7F7] dark:hover:bg-[#1F333D] hover:text-[#4B4B4B] dark:hover:text-white"
                  )}
                >
                  <Icon
                    className={clsx(
                      "w-6 h-6 stroke-[2.5] shrink-0",
                      isActive ? "stroke-[#1CB0F6]" : "stroke-current"
                    )}
                  />
                  <span className="hidden lg:inline truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Promo Card (Visible on Desktop >= 1024px) */}
        <div className="hidden lg:block p-4 rounded-2xl border-2 border-[#E5E5E5] dark:border-[#263843] bg-[#F7F7F7] dark:bg-[#18272F] space-y-2.5">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#FFC800] fill-[#FFC800]" />
            <h4 className="text-xs font-black uppercase text-[#4B4B4B] dark:text-white tracking-wider">
              Want to learn chess?
            </h4>
          </div>
          <p className="text-[11px] font-bold text-[#777777] dark:text-[#8598A3] leading-snug">
            Master tactics, openings, and endgame strategies.
          </p>
          <Link href="/learn" className="block pt-1">
            <Button3D variant="white" size="sm" fullWidth className="text-xs font-black">
              Try Chess
            </Button3D>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Fixed full-width bottom bar for <768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#131F24] border-t-2 border-[#E5E5E5] dark:border-[#263843] flex items-center justify-around z-50 select-none px-2 shadow-lg">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/learn" && pathname === "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={clsx(
                "flex flex-col items-center justify-center min-w-[54px] min-h-[48px] px-2 py-1 rounded-xl transition-all duration-100 touch-manipulation",
                isActive
                  ? "text-[#1CB0F6]"
                  : "text-[#777777] dark:text-[#8598A3] hover:text-[#4B4B4B] dark:hover:text-white"
              )}
            >
              <div
                className={clsx(
                  "p-1 rounded-xl transition-all",
                  isActive ? "bg-[#DDF4FF] dark:bg-[#18272F] border-2 border-[#84D8FF] dark:border-[#1CB0F6]" : ""
                )}
              >
                <Icon
                  className={clsx(
                    "w-5 h-5 stroke-[2.5]",
                    isActive ? "stroke-[#1CB0F6]" : "stroke-current"
                  )}
                />
              </div>
              <span className="text-[9px] font-black uppercase mt-0.5 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
