"use client";

// Sound effects utility with instant Web Audio / HTML5 audio support

export type SoundType =
  | "correct"
  | "incorrect"
  | "complete"
  | "tap"
  | "legendary_complete"
  | "timer_warning";

const soundCache: Partial<Record<SoundType, HTMLAudioElement>> = {};

export function playSound(type: SoundType, volume = 0.8) {
  if (typeof window === "undefined") return;

  try {
    const path = `/sounds/${type}.mp3`;
    let audio = soundCache[type];

    if (!audio) {
      audio = new Audio(path);
      soundCache[type] = audio;
    } else {
      audio.currentTime = 0;
    }

    audio.volume = volume;
    audio.play().catch((err) => {
      // Fallback synthesizer using Web Audio API if file autoplay is restricted
      synthesizeFallbackSound(type, volume);
    });
  } catch (err) {
    synthesizeFallbackSound(type, volume);
  }
}

function synthesizeFallbackSound(type: SoundType, volume: number) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "timer_warning") {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.1);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(volume * 0.4, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.22);
    } else if (type === "legendary_complete") {
      const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.12;
        const dur = idx === notes.length - 1 ? 0.6 : 0.15;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(volume * 0.5, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
    }
  } catch {
    // Ignore audio context initialization failures
  }
}

export const sound = {
  playCorrect: (volume = 0.8) => playSound("correct", volume),
  playIncorrect: (volume = 0.8) => playSound("incorrect", volume),
  playComplete: (volume = 0.8) => playSound("complete", volume),
  playTap: (volume = 0.5) => playSound("tap", volume),
  playLegendaryComplete: (volume = 0.9) => playSound("legendary_complete", volume),
  playTimerWarning: (volume = 0.6) => playSound("timer_warning", volume),
};
