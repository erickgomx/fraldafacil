import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Newsreader", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        cream: {
          50: "#FCFAF6",
          100: "#F7F3EC",
          200: "#EFE8DC",
          300: "#E3D8C6",
        },
        charcoal: {
          900: "#1C1917",
          800: "#292524",
          700: "#44403C",
          600: "#57534E",
          500: "#78716C",
          400: "#A8A29E",
        },
        dusty: {
          blue: "#4A6B82",
          "blue-light": "#E9F0F4",
          rose: "#B86B77",
          "rose-light": "#F8ECED",
        },
        terracotta: "#C2765B",
        warm: {
          border: "#E7E2DA",
          muted: "#78716C",
          surface: "#FBF9F5",
        },
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-120%) skewX(-20deg)" },
          "60%, 100%": { transform: "translateX(260%) skewX(-20deg)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.55" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(18px,-14px,0) scale(1.06)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out both",
        shimmer: "shimmer 4.5s cubic-bezier(0.4,0,0.2,1) infinite",
        "spin-slow": "spin-slow 7s linear infinite",
        float: "float 4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.22,1,0.36,1) infinite",
        drift: "drift 14s ease-in-out infinite",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(28, 25, 23, 0.04), 0 1px 2px -1px rgba(28, 25, 23, 0.04)",
        card: "0 4px 12px -2px rgba(28, 25, 23, 0.05), 0 2px 6px -2px rgba(28, 25, 23, 0.03)",
        elevated: "0 12px 24px -4px rgba(28, 25, 23, 0.08), 0 4px 8px -2px rgba(28, 25, 23, 0.03)",
        lift: "0 22px 40px -12px rgba(28, 25, 23, 0.18), 0 8px 16px -8px rgba(28, 25, 23, 0.08)",
        featured: "0 30px 60px -18px rgba(28, 25, 23, 0.45), 0 12px 24px -12px rgba(194, 118, 91, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
