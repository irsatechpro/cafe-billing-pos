/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#F5EFE6',
          200: '#EFE6D8',
          300: '#E5DCCB',
          400: '#D9CDBC',
        },
        espresso: {
          950: '#1F120C',
          900: '#2C1A14',
          800: '#3E2723',
          700: '#4E342E',
          600: '#5D4037',
          500: '#6D4C41',
        },
        gold: {
          light: '#E5C170',
          DEFAULT: '#C8963E',
          dark: '#B8860B',
          accent: '#A67C1E',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
