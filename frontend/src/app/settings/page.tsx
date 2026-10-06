"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import TopBar from "@/components/ui/TopBar";
import { useMe, useUpdateSettings, useAdvanceDay, useResetDemo } from "@/hooks/useDuolingo";
import Button3D from "@/components/ui/Button3D";
import { Volume2, VolumeX, Moon, Sun, Target, FastForward, RotateCcw, Shield, HelpCircle, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { data: user, isLoading } = useMe();
  const updateSettings = useUpdateSettings();
  const advanceDay = useAdvanceDay();
  const resetDemo = useResetDemo();

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-snow">
        <Sidebar />
        <div className="flex-1 p-8 text-center text-wolf font-bold">Loading settings...</div>
        <RightSidebar />
      </div>
    );
  }

  const goals = [10, 20, 30, 50];

  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 border-r-2 border-swan/40">
        <TopBar />

        <main className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8 select-none">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-eel">Settings</h1>
            <p className="text-wolf font-bold text-sm mt-1">Manage your learning goals and preferences</p>
          </div>

          {/* Daily Goal Settings */}
          <section className="bg-white rounded-3xl p-6 border-2 border-swan shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#DDF4FF] text-[#1CB0F6]">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-eel">Daily Goal</h3>
                <p className="text-xs font-bold text-wolf">Choose your daily XP learning target</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {goals.map((g) => {
                const isSelected = user.daily_goal_xp === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => updateSettings.mutate({ daily_goal_xp: g })}
                    className={`py-3 px-4 rounded-2xl font-extrabold text-sm border-2 border-b-4 transition-all duration-75 ${
                      isSelected
                        ? "bg-[#DDF4FF] border-[#1CB0F6] border-b-[#1899D6] text-[#1CB0F6]"
                        : "bg-white border-swan hover:bg-polar text-eel active:translate-y-[2px] active:border-b-2"
                    }`}
                  >
                    {g} XP / day
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sound & Appearance Toggles */}
          <section className="bg-white rounded-3xl p-6 border-2 border-swan shadow-sm space-y-4">
            <h3 className="text-lg font-black text-eel">Preferences</h3>

            <div className="flex items-center justify-between py-3 border-b border-swan/60">
              <div className="flex items-center gap-3">
                {user.sound_enabled ? (
                  <Volume2 className="w-5 h-5 text-[#58CC02]" />
                ) : (
                  <VolumeX className="w-5 h-5 text-wolf" />
                )}
                <div>
                  <h4 className="text-sm font-black text-eel">Sound Effects</h4>
                  <p className="text-xs font-bold text-wolf">Play sounds for correct and wrong answers</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSettings.mutate({ sound_enabled: !user.sound_enabled })}
                className={`w-14 h-8 rounded-full transition-colors relative p-1 ${
                  user.sound_enabled ? "bg-[#58CC02]" : "bg-swan"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    user.sound_enabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-swan/60">
              <div className="flex items-center gap-3">
                {user.dark_mode ? (
                  <Moon className="w-5 h-5 text-[#CE82FF]" />
                ) : (
                  <Sun className="w-5 h-5 text-[#FFC800]" />
                )}
                <div>
                  <h4 className="text-sm font-black text-eel">Dark Mode</h4>
                  <p className="text-xs font-bold text-wolf">Adjust brightness and contrast</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSettings.mutate({ dark_mode: !user.dark_mode })}
                className={`w-14 h-8 rounded-full transition-colors relative p-1 ${
                  user.dark_mode ? "bg-[#58CC02]" : "bg-swan"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    user.dark_mode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Dev Time Machine Controls */}
          <section className="bg-polar rounded-3xl p-6 border-2 border-swan space-y-4">
            <div>
              <h3 className="text-lg font-black text-eel">Developer Sandbox & Time-Machine</h3>
              <p className="text-xs font-bold text-wolf mt-0.5">
                Simulate day rollover and test streak / lazy heart regeneration logic live
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button3D
                variant="green"
                size="md"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => advanceDay.mutate()}
                disabled={advanceDay.isPending}
              >
                <FastForward className="w-4 h-4" />
                <span>Advance +1 Day</span>
              </Button3D>

              <Button3D
                variant="red"
                size="md"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => resetDemo.mutate()}
                disabled={resetDemo.isPending}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Demo Seed</span>
              </Button3D>
            </div>
          </section>

          {/* Placeholders */}
          <section className="bg-white rounded-3xl p-6 border-2 border-swan shadow-sm space-y-3">
            <h3 className="text-lg font-black text-eel">Account & Help</h3>
            <div className="space-y-2 text-sm font-bold text-wolf">
              <div className="flex items-center gap-3 py-2 border-b border-swan/40 hover:text-eel cursor-pointer">
                <Shield className="w-4 h-4" />
                <span>Privacy & Safety (Coming Soon)</span>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-swan/40 hover:text-eel cursor-pointer">
                <HelpCircle className="w-4 h-4" />
                <span>Help Center & FAQ</span>
              </div>
              <div className="flex items-center gap-3 py-2 text-[#FF4B4B] hover:opacity-80 cursor-pointer">
                <LogOut className="w-4 h-4" />
                <span>Sign Out (Default Learner niso)</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      <RightSidebar />
    </div>
  );
}
