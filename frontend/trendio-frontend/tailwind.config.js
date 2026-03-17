/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff0f3',
          100: '#ffe0e8',
          200: '#ffc2d1',
          300: '#ff94af',
          400: '#ff5c85',
          500: '#ff3f6c',
          600: '#ed1c5a',
          700: '#c8114a',
          800: '#a81040',
          900: '#8c1239',
        }
      }
    },
  },
  plugins: [],
}