/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#E8D5A3',
          DEFAULT: '#D4AF37',
          dark: '#B8960C',
        },
        luxury: {
          white:    '#FFFFFF',
          offwhite: '#F5F5F5',
          gray:     '#E8E8E8',
          midgray:  '#999999',
          darkgray: '#444444',
          black:    '#000000',
        }
      },
      fontFamily: {
        sans:   ['Inter', 'sans-serif'],
        serif:  ['Playfair Display', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest: '0.3em',
        wider:  '0.15em',
      },
      transitionDuration: {
        400: '400ms',
      }
    },
  },
  plugins: [],
}