export default {
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
  ],
  theme: {
  extend: {
    colors: {
      debug: '#ff00ff',
    },
  },
},
  plugins: [],
}