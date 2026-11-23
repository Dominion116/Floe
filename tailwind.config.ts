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
        ink: {
          DEFAULT: "#121111",
          soft: "#262424",
          muted: "#666464",
        },
        mist: {
          DEFAULT: "#CCD3CD",
          light: "#EAEFEA",
          dark: "#B4BCB5",
        },
        frost: {
          DEFAULT: "#C3CEEF",
          light: "#E4EAFA",
          dark: "#98A9E6",
        },
        snow: "#F9F9F9",
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
        subtle: "0 1px 3px rgba(18, 17, 17, 0.04), 0 6px 16px rgba(18, 17, 17, 0.03)",
        card: "0 10px 30px -10px rgba(18, 17, 17, 0.08)",
        floating: "0 20px 40px -15px rgba(18, 17, 17, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
