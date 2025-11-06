/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f9fafb",
        text: "#111827",
        primary: "#3b82f6",
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
};
