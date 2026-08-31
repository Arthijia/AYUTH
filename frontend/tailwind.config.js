/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ayurveda: {
          dark: '#1b4332',
          primary: '#2d6a4f',
          medium: '#40916c',
          light: '#52b788',
          pale: '#d8f3dc',
          gold: '#d4a373',
          cream: '#fefae0',
          rust: '#bc6c25',
          bg: '#f8f9fa',
          surface: '#ffffff',
          darkbg: '#0f241d',
        }
      }
    },
  },
  plugins: [],
}
