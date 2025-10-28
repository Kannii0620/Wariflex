/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media', // または 'class'
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
    {
      pattern: /bg-\[url\(.*\)\]/, // 動的背景画像を守る
    },
  ],
  theme: {
    extend: {
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