"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/ui/TopBar";
import PathView from "@/features/path/PathView";

export default function LearnPage() {
  return (
    <div className="flex min-h-screen bg-snow">
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Learning Stream */}
      <div className="flex-1 flex flex-col min-w-0 border-r-2 border-swan/40">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-2 sm:px-6">
          <PathView />
        </main>
      </div>

      {/* Right Widgets Sidebar */}
      <RightSidebar />
    </div>
  );
}
