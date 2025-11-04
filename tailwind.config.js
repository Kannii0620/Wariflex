/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-red-500',
    'text-white',
    'p-4',
    'rounded',
    'text-purple-600',
    'bg-yellow-100',
    'border-yellow-400',
  ],
  theme: {
    extend: { // ← "extend" の中に設定
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
        katari: ['"Shippori Mincho"', 'serif'],
      },
      colors: {
        debug: '#ff00ff',
      },
    },
  },
  plugins: [],
};