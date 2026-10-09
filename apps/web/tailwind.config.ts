import type { Config } from "tailwindcss";

/** Design G tokens (docs/DESIGN_G.md). Colours are CSS variables in globals.css. */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "16px", lg: "40px" }, screens: { "2xl": "1168px" } },
    extend: {
      colors: {
        bg: "var(--bg)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        muted: "var(--muted)",
        line: "var(--line)",
        panel: "var(--panel)",
        "panel-2": "var(--panel-2)",
        rood: { DEFAULT: "var(--red)", bg: "var(--red-bg)" },
        groen: { DEFAULT: "var(--green)", bg: "var(--green-bg)", ink: "var(--green-ink)" },
        grijs: "var(--grey)",
        oranje: "var(--amber)",
        blue: { DEFAULT: "var(--blue)", light: "#BFDBFE" },
        dark: { DEFAULT: "#111827", panel: "#1F2937", text: "#D1D5DB", line: "#374151" },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "18px", panel: "24px", btn: "12px", pill: "999px" },
      borderWidth: { DEFAULT: "1.5px", 1: "1px" },
      boxShadow: { float: "0 12px 40px rgba(17, 24, 39, 0.08)" },
      maxWidth: { site: "1168px" },
    },
  },
  plugins: [],
} satisfies Config;
