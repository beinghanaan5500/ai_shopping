/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1a1a1a',
        paper: '#faf8f5',
        'paper-2': '#f3efe9',
        line: '#e5dfd5',
        muted: '#5c5347',
        accent: '#c8541a',
        'accent-soft': '#f5e6dc',
        success: '#4a7c59',
        warning: '#b8860b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
};
