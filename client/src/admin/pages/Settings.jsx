import React from "react";
import AdminLayout from "../AdminLayout";

const Settings = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <AdminLayout title="Settings" breadcrumb="Admin / Settings" user={user}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#10172a] rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-200">Profile Settings</h3>
          <div className="text-gray-500 dark:text-gray-400">[Profile form placeholder]</div>
        </div>
        <div className="bg-white dark:bg-[#10172a] rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-200">Security</h3>
          <div className="text-gray-500 dark:text-gray-400">[Security settings placeholder]</div>
        </div>
        <div className="bg-white dark:bg-[#10172a] rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-200">Notifications</h3>
          <div className="text-gray-500 dark:text-gray-400">[Notification settings placeholder]</div>
        </div>
        <div className="bg-white dark:bg-[#10172a] rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-200">System Settings</h3>
          <div className="text-gray-500 dark:text-gray-400">[System settings placeholder]</div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings; 