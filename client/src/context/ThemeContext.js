// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark", "solarized", "frost");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const body = document.body;
    const glowMap = {
      light: "0 0 40px 10px rgba(59, 130, 246, 0.3)",       // blue
      dark: "0 0 40px 10px rgba(255, 255, 255, 0.15)",       // soft white
      solarized: "0 0 40px 10px rgba(38, 139, 210, 0.4)",    // cyan-blue
      frost: "0 0 40px 10px rgba(136, 192, 208, 0.35)",      // icy teal
    };

    body.style.boxShadow = glowMap[theme] || "";
    body.classList.add("theme-switch-transition");

    const timeout = setTimeout(() => {
      body.classList.remove("theme-switch-transition");
      body.style.boxShadow = "";
    }, 400);

    return () => clearTimeout(timeout);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
