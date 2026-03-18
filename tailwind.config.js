/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography"
import daisyui from "daisyui"

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
  },
  plugins: [typography, daisyui],
  daisyui: {
    themes: [
      {
        buoyfishtheme: {
          primary: "#1556ac",
          "primary-content": "#ffffff",
          secondary: "#3b82f6",
          "secondary-content": "#ffffff",
          neutral: "#0f172a",
          "neutral-content": "#f8fafc",
          accent: "#0ea5e9",
          "accent-content": "#ffffff",
          "base-content": "#0f172a",
          "base-100": "#f8fafc",
          "base-200": "#f1f5f9",
          "base-300": "#e2e8f0",
          success: "#37d399",
          warning: "#f59e0b",
          error: "#f77272",
          info: "#3b82f6",
        },
      },
    ],
  },
}
