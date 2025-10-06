// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: ["light", "dark", "solarized", "frost"], // ✅ Ensure all themes are safe
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 20px rgba(59, 130, 246, 0.6)", // blue glow
      },
    },
  },
  plugins: [],
};
