/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Add your design system colors here
        // Example:
        // primary: '#your-color',
        // secondary: '#your-color',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
      fontSize: {
        // Add your design system font sizes here
      },
      borderRadius: {
        // Add your design system border radius here
        // Example:
        // card: '12px',
      },
    },
  },
  plugins: [],
}
