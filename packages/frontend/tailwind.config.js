/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3f9',
          100: '#d9e0f0',
          200: '#b3c1e0',
          300: '#8da2d1',
          400: '#6683c1',
          500: '#4064b2',
          600: '#33508e',
          700: '#263c6b',
          800: '#1a2847',
          900: '#0d1424',
          950: '#070a12',
        },
        volt: {
          DEFAULT: '#c8ee44',
          50: '#f8fde6',
          100: '#f0fbcc',
          200: '#e1f799',
          300: '#d5f46e',
          400: '#c8ee44',
          500: '#a8cc1a',
          600: '#85a314',
          700: '#637a0f',
          800: '#42520a',
          900: '#212905',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
