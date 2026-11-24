import type { Config } from "tailwindcss";

// Every color resolves to a CSS custom property declared in globals.css.
const token = (name: string) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  future: {
    // Puts every hover: utility behind @media (hover: hover)
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        white: token("white"),
        snow: token("snow"),
        ink: { DEFAULT: token("ink"), soft: token("ink-soft"), muted: token("ink-muted") },
        mist: { DEFAULT: token("mist"), light: token("mist-light"), dark: token("mist-dark") },
        frost: { DEFAULT: token("frost"), light: token("frost-light"), dark: token("frost-dark") },
        control: token("control"),
        success: { DEFAULT: token("success"), fill: token("success-fill") },
        warning: { DEFAULT: token("warning"), fill: token("warning-fill") },
        danger: {
          DEFAULT: token("danger"),
          fill: token("danger-fill"),
          solid: token("danger-solid"),
        },
        code: { keyword: token("code-keyword"), string: token("code-string") },
        theme: {
          glacial: { DEFAULT: token("theme-glacial"), accent: token("theme-glacial-accent") },
          coffee: { DEFAULT: token("theme-coffee"), accent: token("theme-coffee-accent") },
          birthday: { DEFAULT: token("theme-birthday"), accent: token("theme-birthday-accent") },
          water: { DEFAULT: token("theme-water"), accent: token("theme-water-accent") },
        },
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        // Overlays only. Everything in the page flow uses hairlines or tonal steps.
        floating:
          "0 0 0 1px rgb(var(--ink-rgb) / 0.06), 0 6px 6px -3px rgb(var(--ink-rgb) / 0.06), 0 24px 24px -12px rgb(var(--ink-rgb) / 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
