"use client";

// Sound effects utility with instant Web Audio / HTML5 audio support

export type SoundType = "correct" | "incorrect" | "complete" | "tap";

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
      // Browsers may block unprompted autoplay before first gesture
      console.debug(`[Sound] Audio playback prevented for ${type}:`, err);
    });
  } catch (err) {
    console.debug(`[Sound] Audio error for ${type}:`, err);
  }
}
