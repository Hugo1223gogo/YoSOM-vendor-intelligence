import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "var(--cream)",
        "cream-2": "var(--cream-2)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        coral: "var(--coral)",
        "coral-deep": "var(--coral-deep)",
        yale: "var(--yale)",
        muted: "var(--muted)",
        line: "var(--line)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "SF Pro Text",
          "SF Pro Display",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        display: ["Fraunces", "Georgia", "serif"],
      },
      borderRadius: {
        bubble: "22px",
        card: "18px",
        cta: "20px",
        icon: "16px",
        avatar: "12px",
        pill: "999px",
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.96)" },
          "60%": { opacity: "1", transform: "translateY(-2px) scale(1.01)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        typing: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-3px)", opacity: "1" },
        },
        "heart-burst": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
      animation: {
        "pop-in":
          "pop-in 360ms cubic-bezier(0.2, 0.9, 0.3, 1.2) both",
        "fade-up": "fade-up 320ms ease-out both",
        typing: "typing 1.2s ease-in-out infinite",
        "heart-burst":
          "heart-burst 380ms cubic-bezier(0.3, 1.4, 0.5, 1) both",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
