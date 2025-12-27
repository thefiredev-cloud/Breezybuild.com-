import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color (amber/orange spectrum per spec)
        primary: {
          DEFAULT: '#F97316', // amber-500 per spec (actually orange-500)
          light: '#FB923C',   // amber-400 per spec
          dark: '#EA580C',    // amber-600
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Accent (golden amber)
        accent: {
          DEFAULT: '#FCD34D', // amber-300 per spec
          light: '#FDE68A',
          dark: '#FBBF24',
        },
        // Dark mode surface colors (zinc spectrum per spec)
        dark: {
          DEFAULT: '#09090b', // zinc-950
          surface: '#18181b', // zinc-900
          border: '#27272a',  // zinc-800
          muted: '#71717a',   // zinc-500
        },
        // Light colors
        light: {
          DEFAULT: '#f4f4f5', // zinc-100
          surface: '#fafafa', // zinc-50
        },
      },
      fontFamily: {
        // Display font for headings (Syne)
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        // Body font (DM Sans)
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Mono font for code
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Fluid typography scale per spec
        'hero': 'clamp(2.5rem, 5vw, 4rem)',
        'h1': 'clamp(2rem, 4vw, 3rem)',
        'h2': 'clamp(1.5rem, 3vw, 2rem)',
        'h3': 'clamp(1.25rem, 2vw, 1.5rem)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // New amber-based gradients
        'gradient-primary': 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)',
        'gradient-dark': 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
        'gradient-hero-dark': 'linear-gradient(180deg, rgba(249,115,22,0.1) 0%, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'check-draw': 'checkDraw 0.6s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spinSlow 30s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        checkDraw: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        // Amber-based shadows
        'primary': '0 4px 14px 0 rgba(249, 115, 22, 0.25)',
        'primary-lg': '0 10px 40px 0 rgba(249, 115, 22, 0.3)',
        'primary-glow': '0 0 40px rgba(249, 115, 22, 0.4)',
        // Card shadows
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 40px -10px rgba(249, 115, 22, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [typography],
};

export default config;
