"use client";

import React from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/ui/TopBar";
import Button3D from "@/components/ui/Button3D";
import { Sparkles } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 border-r-2 border-swan/40">
        <TopBar />

        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none space-y-6">
          <div className="relative">
            <span className="text-8xl animate-bounce">🦉</span>
            <div className="absolute -top-3 -right-3 p-2 bg-[#FFC800] rounded-full text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <h1 className="text-3xl font-black text-eel">Coming Soon!</h1>
            <p className="text-wolf font-bold text-base">
              We&apos;re still crafting and polishing this feature for the Duolingo experience. Stay tuned!
            </p>
          </div>

          <Link href="/learn" className="w-full max-w-xs">
            <Button3D variant="green" fullWidth size="lg">
              Back to Learning Path
            </Button3D>
          </Link>
        </main>
      </div>

      <RightSidebar />
    </div>
  );
}
