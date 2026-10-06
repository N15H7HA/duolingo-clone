"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Button3D from "@/components/ui/Button3D";

export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[LessonErrorBoundary] Caught error:", error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-snow p-6 text-center space-y-6 select-none">
      <div className="w-20 h-20 rounded-full bg-feedbackRedBg flex items-center justify-center text-4xl shadow-inner">
        💔
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-black text-cardinal">Something went wrong</h2>
        <p className="text-wolf font-bold text-sm">
          {error.message || "An unexpected error occurred during the lesson session."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Button3D variant="green" fullWidth size="md" onClick={() => reset()}>
          Try Again
        </Button3D>
        <Link href="/learn" className="w-full">
          <Button3D variant="white" fullWidth size="md">
            Return to Path
          </Button3D>
        </Link>
      </div>
    </div>
  );
}
