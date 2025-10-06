import React from "react";

const AdminTable = ({ columns, data, renderRow }) => {
  console.log("[AdminTable] data:", data);
  console.log("[AdminTable] renderRow:", renderRow);
  return (
    <div className="overflow-x-auto rounded-xl shadow bg-white dark:bg-[#10172a]">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-2 border-b bg-blue-600 text-white dark:bg-blue-800 font-semibold text-left">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-gray-400 dark:text-gray-500">No data found.</td>
            </tr>
          ) : (
            data.map(renderRow)
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable; 