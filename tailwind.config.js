/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#1D4ED8",
          light: "#60A5FA",
          electric: "#00E5FF",
        },
        secondary: {
          DEFAULT: "#1F2937",
          dark: "#111827",
          light: "#374151",
        },
        surface: {
          DEFAULT: "#161618",
          lighter: "#1C1C1E",
          darker: "#0E0E0F",
        },
        border: "#27272A",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'electric': '0 0 20px -5px rgba(0, 229, 255, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
