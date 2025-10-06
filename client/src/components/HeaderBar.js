// ✅ HeaderBar.jsx — now using theme engine correctly
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import ThemeSelector from "../components/ThemeSelector";
import {
  Bell,
  Sun,
  Moon,
  UserCircle2,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeaderBar = () => {
  const { theme, setTheme } = useTheme(); // ✅ fixed
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-md px-6 py-4 shadow flex justify-between items-center">
      <div className="text-blue-700 text-lg font-semibold">
        {theme === "dark" ? "🌙" : "☀️"} {greeting}, {user?.name || "Guest"}!
      </div>

      <div className="flex items-center gap-4 relative">
        <Bell className="text-gray-600 cursor-pointer hover:text-blue-600 transition" size={20} />

        {/* Theme Toggle Icon */}
        <motion.button
          whileTap={{ rotate: 180, scale: 0.9 }}
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.3, type: "spring" }}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle Theme"
          className="text-gray-600 hover:text-blue-600 transition"
        >
          {theme === "dark" ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <Sun size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Moon size={20} />
            </motion.div>
          )}
        </motion.button>


        {/* Theme Selector Dropdown */}
        <ThemeSelector />

        {/* Avatar / Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="rounded-full p-1 hover:ring-2 hover:ring-blue-500 transition"
          >
            <UserCircle2 className="text-gray-700" size={28} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden border z-50"
              >
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <User size={16} /> Profile
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Settings size={16} /> Settings
                </button>
                <hr />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;
