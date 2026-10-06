"use client";

import React, { useState } from "react";
import { FastForward, RotateCcw, Wrench, X, Clock, CheckCircle, Flame, Heart } from "lucide-react";
import { useAdvanceDay, useResetDemo, useMe } from "@/hooks/useDuolingo";
import Button3D from "@/components/ui/Button3D";

export default function DevDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: user } = useMe();
  const advanceDay = useAdvanceDay();
  const resetDemo = useResetDemo();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAdvanceDay = () => {
    advanceDay.mutate(undefined, {
      onSuccess: (data: any) => {
        showToast(`Clock advanced +1 Day (Simulated Offset: +${data.simulated_day_offset}d)`);
      },
    });
  };

  const handleResetDemo = () => {
    resetDemo.mutate(undefined, {
      onSuccess: () => {
        showToast("Database restored to clean initial demo seed!");
        setIsOpen(false);
      },
    });
  };

  return (
    <>
      {/* Floating Action Pill */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-eel hover:bg-black text-snow font-black text-xs uppercase tracking-wider shadow-2xl border-2 border-white/20 active:scale-95 transition cursor-pointer"
        >
          <Wrench className="w-4 h-4 text-bee animate-spin-slow" />
          <span>Demo Tools</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-eel text-snow px-5 py-3 rounded-2xl border-2 border-featherGreen shadow-2xl flex items-center gap-2.5 text-xs font-black animate-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-4 h-4 text-featherGreen" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal / Sheet Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-snow rounded-3xl p-6 max-w-sm w-full border-2 border-swan shadow-2xl space-y-5 animate-in slide-in-from-bottom sm:slide-in-from-right duration-200 select-none">
            {/* Drawer Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-bee" />
                <h3 className="font-black text-lg text-eel">Developer Sandbox</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-wolf hover:text-eel p-1 rounded-xl hover:bg-polar transition"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Current State Info */}
            {user && (
              <div className="p-4 bg-polar rounded-2xl border border-swan text-xs space-y-2">
                <div className="flex justify-between font-bold text-wolf">
                  <span>Simulated Offset:</span>
                  <span className="text-macaw font-black">+{user.simulated_day_offset} Days</span>
                </div>
                <div className="flex justify-between font-bold text-wolf">
                  <span>Current Hearts:</span>
                  <span className="text-cardinal font-black">{user.hearts} / 5</span>
                </div>
                <div className="flex justify-between font-bold text-wolf">
                  <span>Active Streak:</span>
                  <span className="text-fox font-black">{user.streak} Days</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button3D
                variant="blue"
                fullWidth
                size="md"
                disabled={advanceDay.isPending}
                onClick={handleAdvanceDay}
              >
                <div className="flex items-center justify-center gap-2">
                  <FastForward className="w-4 h-4" />
                  <span>{advanceDay.isPending ? "Advancing..." : "Advance 1 Day (+24h)"}</span>
                </div>
              </Button3D>

              <Button3D
                variant="white"
                fullWidth
                size="md"
                disabled={resetDemo.isPending}
                onClick={handleResetDemo}
                className="border-cardinal/30 text-cardinal hover:bg-feedbackRedBg"
              >
                <div className="flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>{resetDemo.isPending ? "Resetting..." : "Reset Demo Data"}</span>
                </div>
              </Button3D>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
