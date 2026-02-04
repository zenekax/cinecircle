/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta estilo Supabase
        brand: {
          DEFAULT: '#3ECF8E',
          50: '#F0FDF9',
          100: '#CCFBEF',
          200: '#9AF5DF',
          300: '#5FEAC8',
          400: '#3ECF8E',
          500: '#24B47E',
          600: '#1A9466',
          700: '#177453',
          800: '#165C44',
          900: '#134D39',
        },
        dark: {
          DEFAULT: '#1C1C1C',
          50: '#F8F8F8',
          100: '#E0E0E0',
          200: '#2A2A2A',
          300: '#232323',
          400: '#1C1C1C',
          500: '#171717',
          600: '#141414',
          700: '#111111',
          800: '#0D0D0D',
          900: '#090909',
        },
        surface: {
          100: '#242424',
          200: '#1E1E1E',
          300: '#181818',
        },
        border: {
          DEFAULT: '#2E2E2E',
          light: '#3E3E3E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(62, 207, 142, 0.15)',
        'glow-lg': '0 0 40px rgba(62, 207, 142, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
