import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        featherGreen: "#58CC02",
        featherGreenShadow: "#58A700",
        maskGreen: "#89E219",
        feedbackGreenBg: "#D7FFB8",
        cardinal: "#FF4B4B",
        cardinalShadow: "#EA2B2B",
        feedbackRedBg: "#FFDFE0",
        macaw: "#1CB0F6",
        macawShadow: "#1899D6",
        selectedCardBg: "#DDF4FF",
        bee: "#FFC800",
        fox: "#FF9600",
        beetle: "#CE82FF",
        eel: "#4B4B4B",
        wolf: "#777777",
        hare: "#AFAFAF",
        swan: "#E5E5E5",
        polar: "#F7F7F7",
        snow: "#FFFFFF",
      },
      fontFamily: {
        nunito: ["var(--font-nunito)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
