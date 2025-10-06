// ✅ SidebarLayout.js — enhanced with dynamic theme switching + unique animation effects
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  Home,
  UploadCloud,
  History,
  UserCog,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SidebarLayout = ({ children }) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user"));
  const [collapsed, setCollapsed] = useState(false);
  const location = window.location; // Will be replaced with useLocation for SPA

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    alert("Logged out successfully!");
  };

  const MenuItem = ({ icon: Icon, label, path }) => (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(path)}
      className={`flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-blue-100/40 dark:hover:bg-blue-900/40 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${location.pathname === path ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
      aria-label={label}
      aria-current={location.pathname === path ? 'page' : undefined}
      tabIndex={0}
      role="menuitem"
    >
      <Icon size={18} /> {!collapsed && <span>{label}</span>}
    </motion.button>
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-500 ease-in-out">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`${
          collapsed ? "w-26" : "w-60"
        } flex-shrink-0 bg-blue-600/60 dark:bg-blue-900/60 text-white p-4 flex flex-col justify-between shadow-lg`}
        role="navigation"
        aria-label="Main sidebar navigation"
      >
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold mb-6 cursor-pointer"
            onClick={() => navigate("/dashboard")}
            tabIndex={0}
            role="heading"
            aria-level={1}
          >
            {collapsed ? "📊" : "Excel Analytics"}
          </motion.h2>

          <nav className="space-y-2" aria-label="Sidebar menu" role="menu">
            <MenuItem icon={Home} label="Dashboard" path="/dashboard" />
            {user?.role === "user" && (
              <>
                <MenuItem icon={UploadCloud} label="Upload" path="/upload" />
                <MenuItem icon={History} label="History" path="/history" />
              </>
            )}
            <MenuItem icon={UserCog} label="Profile" path="/profile" />
            {user?.role === "admin" && (
              <MenuItem icon={LayoutDashboard} label="Admin Panel" path="/admin-panel" />
            )}
          </nav>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-m bg-white/90 dark:bg-gray-800 text-blue-700 dark:text-white px-3 py-1 rounded hover:bg-blue-100 dark:hover:bg-gray-700 flex items-center gap-2 justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />} {!collapsed && (theme === "dark" ? "Light" : "Dark")}
          </button>

          <button
            onClick={handleLogout}
            className="text-m bg-white/90 dark:bg-gray-800 text-blue-700 dark:text-white px-3 py-1 rounded hover:bg-red-100 dark:hover:bg-red-600 flex items-center gap-2 justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Logout"
          >
            <LogOut size={16} /> {!collapsed && "Logout"}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-m bg-white/90 dark:bg-gray-800 text-blue-700 dark:text-white px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-gray-700 flex items-center gap-2 justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Collapse sidebar"
          >
            <Menu size={16} /> {!collapsed && "Collapse"}
          </button>
        </div>
      </motion.aside>

      {/* Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-shrink-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md z-40 shadow px-6 py-4 flex justify-between items-center text-gray-900 dark:text-white"
          role="banner"
        >
          <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
            🌞 {greeting()}, {user?.name || "Guest"}!
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Role: {user?.role || "Unknown"}
          </div>
        </motion.header>

        <main role="main" className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        {/* Footer outside the scrollable area, stuck to the bottom */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex-shrink-0 text-center text-sm text-gray-500 dark:text-gray-400 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md"
          role="contentinfo"
        >
          © {new Date().getFullYear()} Excel Analytics Platform. All rights reserved.
        </motion.footer>
      </div>
    </div>
  );
};

export default SidebarLayout;
