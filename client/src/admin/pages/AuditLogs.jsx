import React from "react";
import AdminLayout from "../AdminLayout";
import AdminTable from "../components/AdminTable";

const columns = [
  { key: "action", label: "Action" },
  { key: "user", label: "User" },
  { key: "date", label: "Date" },
  { key: "details", label: "Details" },
];

const logs = [
  { id: 1, action: "User created", user: "Alice", date: "2025-06-27 10:00", details: "Registered via signup form" },
  { id: 2, action: "File uploaded", user: "Bob", date: "2025-06-27 09:30", details: "report.xlsx" },
  { id: 3, action: "User blocked", user: "Admin", date: "2025-06-27 09:00", details: "User: Charlie" },
];

const AuditLogs = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <AdminLayout title="Audit Logs" breadcrumb="Admin / Audit Logs" user={user}>
      <AdminTable
        columns={columns}
        data={logs}
        renderRow={log => (
          <tr key={log.id} className="border-t">
            <td className="px-4 py-2">{log.action}</td>
            <td className="px-4 py-2">{log.user}</td>
            <td className="px-4 py-2">{log.date}</td>
            <td className="px-4 py-2">{log.details}</td>
          </tr>
        )}
      />
    </AdminLayout>
  );
};

export default AuditLogs; 