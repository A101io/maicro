import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { xl: "1200px" } },
    extend: {
      colors: {
        paper: "#F6F4EE",
        ink: "#15202B",
        secondary: "#5B6672",
        rule: "#D9D4C7",
        accent: "#1F4FD8",
        wrong: { DEFAULT: "#B42318", bg: "#FDECEA" },
        doubt: { DEFAULT: "#A15C07", bg: "#FFF3DD" },
        ok: { DEFAULT: "#1B6B3A", bg: "#E6F3EA" },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: { hairline: "0 1px 2px rgba(21,32,43,.08)" },
      borderRadius: { card: "8px", btn: "6px" },
    },
  },
  plugins: [],
} satisfies Config;
