/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dungeon: {
          950: '#0B0A12',
          900: '#11101B',
          850: '#1B1728',
          800: '#231E34',
          700: '#2E2744',
          600: '#3D345B',
          border: 'rgba(139, 92, 246, 0.2)',
          borderGlow: '#8B5CF6',
        },
        sanctum: {
          bg: '#0B0A12',
          sidebar: '#11101B',
          surface: '#1B1728',
          surfaceElevated: '#241E36',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(139, 92, 246, 0.4)',
          text: '#F5F3FF',
          textMuted: '#94A3B8',
          textDim: '#64748B',
        },
        brand: {
          violet: '#8B5CF6',
          purple: '#A78BFA',
          green: '#22C55E',
          red: '#F87171',
          blue: '#60A5FA',
          gold: '#FBBF24',
        },
        magic: {
          purple: '#A78BFA',
          violet: '#8B5CF6',
          neon: '#C084FC',
          deep: '#4C1D95',
        },
        blaze: {
          light: '#fdba74',
          DEFAULT: '#f97316',
          dark: '#ea580c',
          fire: '#ff3700',
        },
        frost: {
          light: '#67e8f9',
          DEFAULT: '#06b6d4',
          dark: '#0891b2',
          ice: '#00f5ff',
        },
        volt: {
          light: '#d8b4fe',
          DEFAULT: '#a855f7',
          dark: '#7e22ce',
          lightning: '#c026d3',
        },
        elder: {
          purple: '#8b5cf6',
          gold: '#fbbf24',
          amber: '#f59e0b',
        },
        xp: {
          gold: '#facc15',
          glow: '#fde047',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        cinzel: ['Cinzel', 'serif'],
        medieval: ['Cinzel Decorative', 'Cinzel', 'serif'],
      },
      boxShadow: {
        'rune': '0 0 15px rgba(168, 85, 247, 0.4), 0 0 30px rgba(168, 85, 247, 0.2)',
        'blaze': '0 0 20px rgba(249, 115, 22, 0.5), 0 0 40px rgba(234, 88, 12, 0.3)',
        'frost': '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(8, 145, 178, 0.3)',
        'volt': '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(126, 34, 206, 0.3)',
        'elder': '0 0 25px rgba(245, 158, 11, 0.4), 0 0 50px rgba(139, 92, 246, 0.3)',
        'neon-inset': 'inset 0 0 15px rgba(168, 85, 247, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px currentColor)' },
          '100%': { opacity: '1', filter: 'drop-shadow(0 0 20px currentColor)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}

