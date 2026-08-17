/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#6366f1', // violet
          600: '#4f46e5',
        },
        accent: {
          500: '#f97316', // orange
        },
      },
    },
  },
  plugins: [],
};
