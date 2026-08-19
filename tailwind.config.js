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
          50: '#eef2f7',
          100: '#d6e0ec',
          200: '#adc1d9',
          300: '#84a3c6',
          400: '#5b84b3',
          500: '#3265a0',
          600: '#274f7e',
          700: '#1d3a5d',
          800: '#16293f',
          900: '#111c2b',
          950: '#0a1118',
        },
        // Map sky/blue/cyan to the institutional palette so the whole site
        // picks up the #111C2B color scheme automatically.
        sky: {
          50: '#eef2f7',
          100: '#d6e0ec',
          200: '#adc1d9',
          300: '#84a3c6',
          400: '#5b84b3',
          500: '#3265a0',
          600: '#274f7e',
          700: '#1d3a5d',
          800: '#16293f',
          900: '#111c2b',
          950: '#0a1118',
        },
        blue: {
          50: '#eef2f7',
          100: '#d6e0ec',
          200: '#adc1d9',
          300: '#84a3c6',
          400: '#5b84b3',
          500: '#3265a0',
          600: '#274f7e',
          700: '#1d3a5d',
          800: '#16293f',
          900: '#111c2b',
          950: '#0a1118',
        },
        cyan: {
          50: '#eef2f7',
          100: '#d6e0ec',
          200: '#adc1d9',
          300: '#84a3c6',
          400: '#5b84b3',
          500: '#3265a0',
          600: '#274f7e',
          700: '#1d3a5d',
          800: '#16293f',
          900: '#111c2b',
          950: '#0a1118',
        },
        night: {
          800: '#16293f',
          900: '#111c2b',
          950: '#0a1118',
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
        'glow-sky': '0 0 40px -8px rgba(50, 101, 160, 0.35)',
        'glow-blue': '0 0 40px -8px rgba(39, 79, 126, 0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
