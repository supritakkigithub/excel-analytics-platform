import React from "react";

const AdminHeader = ({ title, breadcrumb, user }) => (
  <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-blue-900 border-b dark:border-blue-800">
    <div>
      <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">{breadcrumb}</div>
      <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-200">{title}</h1>
    </div>
    <div className="flex items-center gap-3">
      <img src={user?.avatar || "/default-avatar.png"} alt="avatar" className="w-9 h-9 rounded-full border" />
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800 dark:text-gray-100">{user?.name || "Admin"}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{user?.role || "admin"}</span>
      </div>
    </div>
  </header>
);

export default AdminHeader; 