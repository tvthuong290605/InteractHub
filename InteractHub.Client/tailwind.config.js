/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        text: "var(--color-text)",
        bg: "var(--color-bg)",
        card: "var(--color-card)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",

        primary: "#1877f2",
        green: "#42b72a",
      }
    },
  },
  plugins: [],
}