import React, { useState } from "react";
import { FaTachometerAlt, FaUsers, FaUpload, FaChartBar, FaCog, FaClipboardList, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { to: "/admin/users", label: "Users", icon: <FaUsers /> },
  { to: "/admin/uploads", label: "Uploads", icon: <FaUpload /> },
  { to: "/admin/analytics", label: "Analytics", icon: <FaChartBar /> },
  { to: "/admin/settings", label: "Settings", icon: <FaCog /> },
  { to: "/admin/logs", label: "Audit Logs", icon: <FaClipboardList /> },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`h-full ${collapsed ? 'w-20' : 'w-64'} bg-white dark:bg-blue-900 border-r dark:border-blue-800 flex flex-col py-6 px-2 transition-all duration-300`}>
      <div className={`mb-8 text-2xl font-bold text-blue-700 dark:text-blue-200 px-4 ${collapsed ? 'text-center px-0' : ''}`}>{!collapsed && 'Admin Panel'}</div>
      <nav className="flex-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-base font-medium transition-colors duration-200 ${isActive ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-800'} ${collapsed ? 'justify-center px-2' : ''}`
            }
            aria-label={link.label}
          >
            {link.icon}
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>
      <button
        className={`mt-8 mx-auto flex items-center justify-center p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-200 ${collapsed ? 'w-10' : 'w-32'}`}
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />} { !collapsed && <span className="ml-2">Collapse</span> }
      </button>
    </aside>
  );
};

export default AdminSidebar; 