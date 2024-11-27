module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          700: '#0369a1'
        }
      },
      animation: {
        'bounce-short': 'bounce 0.5s ease-in-out 1'
      }
    },
  },
  plugins: [],
}