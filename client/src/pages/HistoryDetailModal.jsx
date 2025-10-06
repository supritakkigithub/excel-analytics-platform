import React from "react";
import ChartRenderer from "../components/ChartRenderer";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];
const chartOptions = [
  "Bar",
  "Pie",
  "Line",
  "3D Bar",
  "3D Surface",
  "3D Scatter",
];

const HistoryDetailModal = ({
  open,
  file,
  actionHistory,
  chartData,
  chartType,
  labelField,
  numericFields,
  selectedFields,
  zKey,
  loadingChart,
  chartContainerRef,
  chartRef,
  theme,
  handleExportImage,
  handleExportPDF,
  closeModal,
  setChartType,
  setLabelField,
  setSelectedFields,
  setZKey,
}) => {
  if (!open || !file) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onClick={closeModal}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold focus:outline-none"
          aria-label="Close modal"
        >
          ×
        </button>

        <h3 className="text-xl font-bold mb-2 text-blue-700 dark:text-blue-300">File Details</h3>
        <div className="mb-2">
          <span className="font-semibold">Name:</span> {file.name}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Uploaded At:</span> {new Date(file.uploadedAt).toLocaleString()}
        </div>

        <div className="my-4">
          <div className="font-semibold mb-1">Chart Preview</div>
          {loadingChart ? (
            <div className="text-center text-blue-500 py-8">Loading chart data...</div>
          ) : chartData.length === 0 ? (
            <div className="text-gray-400">No data available for chart.</div>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 mb-2 items-end">
                <div>
                  <label className="block text-xs font-semibold mb-1">Chart Type</label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="border rounded px-2 py-1 w-32 dark:bg-gray-700 dark:text-white"
                  >
                    {chartOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">X-Axis</label>
                  <select
                    value={labelField}
                    onChange={(e) => setLabelField(e.target.value)}
                    className="border rounded px-2 py-1 w-32 dark:bg-gray-700 dark:text-white"
                  >
                    {chartData.length > 0 &&
                      Object.keys(chartData[0]).map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Y-Axis</label>
                  <select
                    multiple
                    value={selectedFields.map((f) => f.value)}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions).map((opt) => ({
                        value: opt.value,
                        label: opt.value,
                      }));
                      setSelectedFields(options);
                    }}
                    className="border rounded px-2 py-1 w-32 dark:bg-gray-700 dark:text-white"
                  >
                    {numericFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>
                {chartType.includes("3D") && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Z-Axis</label>
                    <select
                      value={zKey || ""}
                      onChange={(e) => setZKey(e.target.value)}
                      className="border rounded px-2 py-1 w-32 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">None</option>
                      {numericFields.map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div
                ref={chartContainerRef}
                className="bg-white dark:bg-gray-900 rounded shadow p-2 mb-2"
                style={{ minHeight: 300 }}
              >
                <ChartRenderer
                  ref={chartRef}
                  type={chartType}
                  data={chartData}
                  theme={theme}
                  xKey={labelField}
                  yKey={selectedFields[0]?.value}
                  zKey={zKey}
                  render2DChart={() => {
                    if (!chartData || chartData.length === 0) return null;
                    switch (chartType) {
                      case "Bar":
                        return (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey={labelField} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              {selectedFields.map((field, idx) => (
                                <Bar
                                  key={field.value}
                                  dataKey={field.value}
                                  fill={COLORS[idx % COLORS.length]}
                                />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        );
                      case "Line":
                        return (
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey={labelField} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              {selectedFields.map((field, idx) => (
                                <Line
                                  key={field.value}
                                  type="monotone"
                                  dataKey={field.value}
                                  stroke={COLORS[idx % COLORS.length]}
                                />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        );
                      case "Pie":
                        return (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              {selectedFields.map((field, idx) => (
                                <Pie
                                  key={field.value}
                                  data={chartData}
                                  dataKey={field.value}
                                  nameKey={labelField}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={100 - idx * 10}
                                  label
                                >
                                  {chartData.map((entry, i) => (
                                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                  ))}
                                </Pie>
                              ))}
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        );
                      default:
                        return null;
                    }
                  }}
                />
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleExportImage}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Download PNG
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  Download PDF
                </button>
              </div>
            </>
          )}
        </div>

        <div className="my-4">
          <div className="font-semibold mb-1">Action History</div>
          <ul className="list-disc pl-5 text-sm">
            {actionHistory.length > 0 ? (
              actionHistory.map((action, idx) => (
                <li key={idx} className="mb-1">
                  <span className="font-medium capitalize">{action.action}</span>
                  {action.chartType && (
                    <span className="ml-2 text-blue-500">[{action.chartType}]</span>
                  )}
                  <span className="ml-2 text-gray-500">
                    {new Date(action.createdAt).toLocaleString()}
                  </span>
                </li>
              ))
            ) : (
              <li>No actions recorded.</li>
            )}
          </ul>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailModal;


