/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        night: {
          800: '#0f172a',
          900: '#090e1a',
          950: '#060b14',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'fade-up-delay': 'fadeUp 0.6s ease-out 0.15s both',
        'fade-up-delay-2': 'fadeUp 0.6s ease-out 0.3s both',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'grid-white': "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
        'grid-slate': "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.06) 1px, transparent 0)",
      },
      backgroundSize: {
        'grid-sm': '40px 40px',
        'grid-md': '56px 56px',
      },
      boxShadow: {
        'glow-sky': '0 0 40px -8px rgba(14, 165, 233, 0.35)',
        'glow-blue': '0 0 40px -8px rgba(59, 130, 246, 0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
