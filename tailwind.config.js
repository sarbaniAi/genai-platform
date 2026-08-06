/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: '#E8EBEE',
        ink: '#181A1F',
        muted: '#5C6470',
        line: '#D5DAE0',
        foundation: '#0E7C86',
        'foundation-tint': '#DDF0F1',
        ai: '#5238C9',
        'ai-tint': '#EAE7FB',
        'ai-line': '#CFC6F3',
      },
    },
  },
  plugins: [],
}
