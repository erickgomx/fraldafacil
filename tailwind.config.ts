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
        },
        dusty: {
          blue: "#4A6B82",
          "blue-light": "#E9F0F4",
          rose: "#B86B77",
          "rose-light": "#F8ECED",
        },
        warm: {
          border: "#E7E2DA",
          muted: "#78716C",
          surface: "#FBF9F5",
        },
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(28, 25, 23, 0.04), 0 1px 2px -1px rgba(28, 25, 23, 0.04)",
        card: "0 4px 12px -2px rgba(28, 25, 23, 0.05), 0 2px 6px -2px rgba(28, 25, 23, 0.03)",
        elevated: "0 12px 24px -4px rgba(28, 25, 23, 0.08), 0 4px 8px -2px rgba(28, 25, 23, 0.03)",
      },
    },
  },
  plugins: [],
};
export default config;
