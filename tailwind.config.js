/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Noto Sans"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
      colors: {
        gh: {
          dark: {
            bg: '#0d1117',
            canvas: '#010409',
            subtle: '#161b22',
            border: '#30363d',
            borderMuted: '#21262d',
            text: '#c9d1d9',
            heading: '#f0f6fc',
            muted: '#8b949e',
            accent: '#2f81f7',
            accentHover: '#388bfd',
            green: '#238636',
            greenHover: '#2ea043',
            red: '#da3633',
            orange: '#d29922',
            purple: '#8957e5',
          },
          light: {
            bg: '#ffffff',
            canvas: '#f6f8fa',
            subtle: '#f3f4f6',
            border: '#d0d7de',
            borderMuted: '#e1e4e8',
            text: '#24292f',
            heading: '#1f2328',
            muted: '#57606a',
            accent: '#0969da',
            accentHover: '#0550ae',
            green: '#1a7f37',
            greenHover: '#116329',
            red: '#cf222e',
            orange: '#9a6700',
            purple: '#8250df',
          }
        }
      }
    },
  },
  plugins: [],
}
