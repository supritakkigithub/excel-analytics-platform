import React from "react";

const HistoryItem = ({ file, user, onView, onDownload, onClean }) => {
  // Find most recent chart type
  const mostRecentChartType = file.actionHistory && file.actionHistory.length > 0
    ? [...file.actionHistory].reverse().find(h => h.action === "chart_generated")?.chartType || "N/A"
    : "N/A";

  return (
    <tr className="border-t hover:bg-blue-50 dark:hover:bg-blue-900">
      <td className="px-4 py-2 border">{file.name}</td>
      <td className="px-4 py-2 border">{new Date(file.uploadedAt).toLocaleString()}</td>
      <td className="px-4 py-2 border">{mostRecentChartType}</td>
      <td className="px-4 py-2 border text-center space-x-2">
        <button
          onClick={() => onView(file)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={`View details for ${file.name}`}
        >
          🔍 View
        </button>
        <button
          onClick={() => onDownload(file._id, "original")}
          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 shadow"
        >
          ⬇️ Original
        </button>
        <button
          onClick={() => onDownload(file._id, "cleaned")}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 shadow"
        >
          ⬇️ Cleaned
        </button>
        {user?.role !== "admin" && (
          <button
            onClick={() => onClean(file._id)}
            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 shadow"
          >
            🧼 Clean
          </button>
        )}
      </td>
    </tr>
  );
};

export default HistoryItem; 