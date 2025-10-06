import React from "react";
import AdminLayout from "../AdminLayout";
import AdminTable from "../components/AdminTable";

const columns = [
  { key: "name", label: "Name" },
  { key: "size", label: "Size" },
  { key: "uploadedBy", label: "Uploaded By" },
  { key: "date", label: "Date" },
  { key: "actions", label: "Actions" },
];

const uploads = [
  { id: 1, name: "report.xlsx", size: "2.1MB", uploadedBy: "Alice", date: "2025-06-27 10:00", },
  { id: 2, name: "data.csv", size: "1.2MB", uploadedBy: "Bob", date: "2025-06-27 09:30", },
];

const UploadManagement = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <AdminLayout title="Upload Management" breadcrumb="Admin / Uploads" user={user}>
      <AdminTable
        columns={columns}
        data={uploads}
        renderRow={(u) => (
          <tr key={u.id}>
            <td className="px-4 py-2 border text-gray-900 dark:text-gray-100">{u.name}</td>
            <td className="px-4 py-2 border text-gray-900 dark:text-gray-100">{u.size}</td>
            <td className="px-4 py-2 border text-gray-900 dark:text-gray-100">{u.uploadedBy}</td>
            <td className="px-4 py-2 border text-gray-900 dark:text-gray-100">{u.date}</td>
            <td className="px-4 py-2 border">{/* Actions to be implemented */}</td>
          </tr>
        )}
      />
    </AdminLayout>
  );
};

export default UploadManagement; 