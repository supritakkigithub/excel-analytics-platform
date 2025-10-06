// ✅ AnimatedBackground.js — SVG animation per theme
import React from "react";
import { useTheme } from "../context/ThemeContext";

const AnimatedBackground = () => {
  const { theme } = useTheme();

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      {theme === "frost" && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-blue-700 opacity-20" />
      )}
      {theme === "solarized" && (
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full absolute opacity-10"
        >
          <circle cx="400" cy="300" r="300" fill="#002b36" />
        </svg>
      )}
      {theme === "light" && (
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 opacity-20" />
      )}
      {theme === "dark" && (
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full absolute opacity-5"
        >
          <path
            fill="#4b5563"
            d="M0 300 Q400 100 800 300 Q400 500 0 300Z"
            opacity="0.2"
          />
        </svg>
      )}
    </div>
  );
};

export default AnimatedBackground;
