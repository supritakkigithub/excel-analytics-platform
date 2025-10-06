// src/components/ThemeSelector.js
import React from "react";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";
import { motion } from "framer-motion";

const themes = [
  { name: "Light", value: "light", color: "#f9fafb" },
  { name: "Dark", value: "dark", color: "#1f2937" },
  { name: "Solarized", value: "solarized", color: "#002b36" },
  { name: "Frost", value: "frost", color: "#2e3440" },
];

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {themes.map((t) => (
        <motion.button
          key={t.value}
          onClick={() => setTheme(t.value)}
          title={t.name}
          whileHover={{ scale: 1.2 }}
          className={clsx(
            "w-6 h-6 rounded-full border-2 transition-all",
            theme === t.value ? "ring-2 ring-blue-500 scale-110" : "opacity-70 hover:opacity-100"
          )}
          style={{ backgroundColor: t.color }}
        />
      ))}
    </div>
  );
};

export default ThemeSelector;
