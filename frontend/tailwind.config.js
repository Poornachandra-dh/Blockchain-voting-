/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: {
          DEFAULT: '#121215',
          card: '#18181b',
          elevated: '#202024',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.16)',
        },
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        muted: '#a1a1aa',
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", 'sans-serif'],
        sans: ["'Inter'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
    },
  },
  plugins: [],
};
