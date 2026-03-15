/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        sand: "#f6f1e8",
        ember: "#ff6a3d",
        gold: "#f5b83d",
        teal: "#0f766e",
        slateblue: "#3751ff",
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.12)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.12) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
