"use client";

import React from "react";
import clsx from "clsx";

export type ButtonVariant = "green" | "blue" | "red" | "white" | "disabled" | "gold";

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
    sm: "h-[42px] px-4 text-sm font-bold",
    md: "h-[50px] px-6 text-base font-extrabold",
    lg: "h-[56px] px-8 text-lg font-extrabold",
  }[size];

  const variantClasses = {
    green:
      "bg-featherGreen text-snow border-featherGreenShadow hover:brightness-105 active:translate-y-[4px] active:border-b-0",
    blue:
      "bg-macaw text-snow border-macawShadow hover:brightness-105 active:translate-y-[4px] active:border-b-0",
    red:
      "bg-cardinal text-snow border-cardinalShadow hover:brightness-105 active:translate-y-[4px] active:border-b-0",
    gold:
      "bg-bee text-snow border-[#E5B200] hover:brightness-105 active:translate-y-[4px] active:border-b-0",
    white:
      "bg-snow text-eel border-swan hover:bg-polar active:translate-y-[4px] active:border-b-0",
    disabled:
      "bg-polar text-hare border-swan cursor-not-allowed active:translate-y-0 active:border-b-4",
  }[isActuallyDisabled ? "disabled" : variant];

  return (
    <button
      disabled={isActuallyDisabled}
      className={clsx(
        "relative inline-flex items-center justify-center rounded-2xl uppercase tracking-wider transition-all duration-75 select-none",
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
