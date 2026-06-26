/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F3FF',     // Tono muy claro del azul principal
          100: '#CCE7FF',    // Tono claro
          200: '#99CEFF',    // Tono medio-claro
          300: '#66B5FF',    // Tono medio
          400: '#339DFF',    // Tono medio-oscuro
          500: '#00A0FF',    // C100 M40 Y0 K0 - Color principal accent
          600: '#0084CC',    // Tono oscuro
          700: '#0069A3',    // Tono más oscuro
          800: '#0050CC',    // C100 M80 Y0 K0 - Color secondary accent
          900: '#003D7A',    // Tono muy oscuro
        },
        background: {
          primary: '#002650',   // C100 M90 Y0 K50 - Fondo principal
          secondary: '#003366', // Variante del fondo
          card: '#004080',      // Fondo de tarjetas
        },
        text: {
          primary: '#F0E6D6',   // C0 M5 Y15 K5 - Texto principal
          secondary: '#E0D0B8', // Texto secundario
        },
        nav: {
          bg: '#1A1A4D',        // C100 M100 Y40 K40 - Navbar y Footer
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        }
      }
    },
  },
  plugins: [],
}