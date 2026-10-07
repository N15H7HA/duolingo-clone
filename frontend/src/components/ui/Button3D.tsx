"use client";

import React from "react";
import clsx from "clsx";

export type ButtonVariant = "green" | "blue" | "red" | "white" | "disabled" | "gold" | "purple";

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button3D({
  variant = "green",
  fullWidth = false,
  size = "md",
  disabled = false,
  className,
  children,
  ...props
}: Button3DProps) {
  const isActuallyDisabled = disabled || variant === "disabled";

  const sizeClasses = {
    sm: "h-[42px] px-4 text-xs font-extrabold tracking-[0.8px]",
    md: "h-[50px] px-6 text-sm font-extrabold tracking-[0.8px]",
    lg: "h-[54px] px-8 text-base font-extrabold tracking-[0.8px]",
  }[size];

  const variantClasses = {
    green:
      "bg-[#58CC02] text-white border-[#58A700] hover:brightness-105 active:translate-y-[2px] active:border-b-2 cursor-pointer",
    blue:
      "bg-[#1CB0F6] text-white border-[#1899D6] hover:brightness-105 active:translate-y-[2px] active:border-b-2 cursor-pointer",
    red:
      "bg-[#FF4B4B] text-white border-[#EA2B2B] hover:brightness-105 active:translate-y-[2px] active:border-b-2 cursor-pointer",
    gold:
      "bg-[#FFC800] text-white border-[#E5A500] hover:brightness-105 active:translate-y-[2px] active:border-b-2 cursor-pointer",
    purple:
      "bg-[#8B5CF6] text-white border-[#7C3AED] hover:brightness-105 active:translate-y-[2px] active:border-b-2 cursor-pointer shadow-purple-500/20",
    white:
      "bg-snow text-eel border-swan hover:bg-polar active:translate-y-[2px] active:border-b-2 cursor-pointer",
    disabled:
      "bg-swan text-hare border-hare/40 cursor-not-allowed active:translate-y-0 active:border-b-4",
  }[isActuallyDisabled ? "disabled" : variant];

  return (
    <button
      disabled={isActuallyDisabled}
      className={clsx(
        "relative inline-flex items-center justify-center rounded-2xl uppercase select-none transition-all duration-75",
        "border-b-4 border-solid",
        sizeClasses,
        variantClasses,
        fullWidth ? "w-full" : "",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
