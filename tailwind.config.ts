import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9e9ff",
          200: "#b3d3ff",
          300: "#7fb6ff",
          400: "#4a94ff",
          500: "#1f70ff",
          600: "#0f56d7",
          700: "#0e44a5",
          800: "#123b73",
          900: "#152f52",
        },
      },
    },
  },
  plugins: [],
};

export default config;
