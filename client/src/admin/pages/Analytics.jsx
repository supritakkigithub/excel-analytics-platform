import React from "react";
import AdminLayout from "../AdminLayout";

const Analytics = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  // Placeholder analytics data
  return (
    <AdminLayout title="Analytics" breadcrumb="Admin / Analytics" user={user}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-[#10172a] rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-200">User Growth</h3>
          <div className="h-40 flex items-center justify-center text-gray-400 dark:text-gray-500">[Chart Placeholder]</div>
        </div>
        <div className="bg-white dark:bg-[#10172a] rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-200">Uploads Over Time</h3>
          <div className="h-40 flex items-center justify-center text-gray-400 dark:text-gray-500">[Chart Placeholder]</div>
        </div>
      </div>
      <div className="bg-white dark:bg-[#10172a] rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-200">Active Users</h3>
        <div className="h-40 flex items-center justify-center text-gray-400 dark:text-gray-500">[Chart Placeholder]</div>
      </div>
    </AdminLayout>
  );
};

export default Analytics; 