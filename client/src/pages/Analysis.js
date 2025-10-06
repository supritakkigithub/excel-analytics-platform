// src/pages/Analysis.js - REFACTORED
import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from "../components/MotionWrapper";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  Label,
} from "recharts";
import { motion } from "framer-motion";
import Select from "react-select";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ChartRenderer from "../components/ChartRenderer";
import { useTheme } from "../context/ThemeContext";
import ThreeDBarChart from '../charts/ThreeDBarChart';
import ThreeDSurfaceChart from '../charts/ThreeDSurfaceChart';

const chartOptions = [
  "Bar",
  "Pie",
  "Line",
  "3D Bar",
  "3D Surface",
  "3D Scatter",
];
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

const Analysis = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const { theme } = useTheme();

  const [data, setData] = useState([]);
  const [numericFields, setNumericFields] = useState([]);
  const [labelField, setLabelField] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedChart, setSelectedChart] = useState("Bar");
  const [zKey, setZKey] = useState(null);

  const chart3DBarRef = useRef();
  const chart3DSurfaceRef = useRef();

  // --- Theme-aware styles for react-select ---
  const customSelectStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#374151' : 'white',
      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
    }),
    singleValue: (styles) => ({ ...styles, color: theme === 'dark' ? 'white' : '#111827' }),
    menu: (styles) => ({ ...styles, backgroundColor: theme === 'dark' ? '#374151' : 'white' }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected ? '#2563eb' : isFocused ? (theme === 'dark' ? '#4b5563' : '#e5e7eb') : 'transparent',
      color: theme === 'dark' ? 'white' : '#111827',
    }),
    multiValue: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
    }),
    multiValueLabel: (styles) => ({
      ...styles,
      color: theme === 'dark' ? 'white' : '#111827',
    }),
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/uploads/content/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);

        if (res.data.length > 0) {
          const firstRow = res.data[0];
          const keys = Object.keys(firstRow);
          const numericKeys = keys.filter(
            (key) => typeof firstRow[key] === "number"
          );
          setNumericFields(numericKeys);
          if (keys.length > 0) setLabelField(keys[0]);
        }
      } catch (err) {
        console.error("Error fetching content:", err);
        alert("Failed to load data.");
      }
    };
    fetchData();
  }, [id, token]);

  // This function now only contains the 2D chart logic.
  // It will be passed to ChartRenderer as a temporary measure.
  const render2DChart = useCallback(() => {
    if (!data || data.length === 0) return null;
    
    switch (selectedChart) {
      case "Bar":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={labelField} />
              <YAxis>
                <Label
                  value={selectedFields.map((f) => f.value).join(", ")}
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: "middle", fill: "#888" }}
                />
              </YAxis>
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
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={labelField} />
              <YAxis>
                <Label
                  value={selectedFields.map((f) => f.value).join(", ")}
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: "middle", fill: "#888" }}
                />
              </YAxis>
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
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              {selectedFields.map((field, idx) => (
                <Pie
                  key={field.value}
                  data={data}
                  dataKey={field.value}
                  nameKey={labelField}
                  cx="50%"
                  cy="50%"
                  outerRadius={100 - idx * 10}
                  label
                >
                  {data.map((entry, i) => (
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
  }, [data, labelField, selectedFields, selectedChart]);

  const exportToImage = async () => {
    const chartNode = document.getElementById("chart-container");
    if (!chartNode) return;
    const canvas = await html2canvas(chartNode);
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "chart.png";
    link.click();
  };

  const exportToPDF = async () => {
    const chartNode = document.getElementById("chart-container");
    if (!chartNode) return;
    const canvas = await html2canvas(chartNode);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 180, 120);
    pdf.save("chart.pdf");
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((field) => `"${row[field] != null ? row[field] : ""}"`).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "analysis_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fieldOptions = numericFields.map(field => ({ value: field, label: field }));
  const labelOptions = data.length > 0 ? Object.keys(data[0]).map(field => ({ value: field, label: field })) : [];

  useEffect(() => {
    // Log a history record when a chart is generated (when selectedChart or selectedFields changes)
    if (!data || data.length === 0 || !selectedChart || selectedFields.length === 0) return;
    const logHistory = async () => {
      try {
        await axios.post(
          "/api/history",
          {
            uploadId: id,
            action: "chart_generated",
            chartType: selectedChart,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        // Optionally log error, but don't block UI
      }
    };
    logHistory();
    // Only log when chart type or selected fields change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChart, selectedFields]);

  return (
    <SidebarLayout>
      <MotionWrapper>
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Analysis</h2>
          
          {/* --- Controls Section --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 flex-shrink-0">
            {/* Chart Type Selector */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chart Type</label>
              <Select
                styles={customSelectStyles}
                options={chartOptions.map(opt => ({ label: opt, value: opt }))}
                onChange={(opt) => setSelectedChart(opt.value)}
                defaultValue={{ label: "Bar", value: "Bar" }}
              />
            </div>
            
            {/* X-Axis Selector */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">X-Axis</label>
              <Select
                styles={customSelectStyles}
                options={labelOptions}
                onChange={(opt) => setLabelField(opt.value)}
                value={labelOptions.find(opt => opt.value === labelField)}
              />
            </div>

            {/* Y-Axis Selector */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Y-Axis</label>
              <Select
                styles={customSelectStyles}
                isMulti
                options={fieldOptions}
                onChange={(opts) => setSelectedFields(opts)}
              />
            </div>

            {/* Z-Axis Selector (Conditional) */}
            {selectedChart.includes('3D') && (
              <motion.div className="flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Z-Axis</label>
                <Select
                  styles={customSelectStyles}
                  options={fieldOptions}
                  onChange={(opt) => setZKey(opt.value)}
                />
              </motion.div>
            )}
          </div>
          
          {/* --- Chart Display Area (takes remaining space) --- */}
          <div id="chart-container" className="bg-white dark:bg-gray-800/50 p-4 rounded shadow flex-grow">
            {data.length > 0 ? (
              selectedChart === '3D Bar' ? (
                <ThreeDBarChart
                  ref={chart3DBarRef}
                  data={data}
                  xKey={labelField}
                  yKey={selectedFields[0]?.value}
                  theme={theme}
                />
              ) : selectedChart === '3D Surface' ? (
                <ThreeDSurfaceChart
                  ref={chart3DSurfaceRef}
                  data={data}
                  xKey={labelField}
                  yKey={selectedFields[0]?.value}
                  zKey={zKey}
                  theme={theme}
                />
              ) : (
                <ChartRenderer
                  type={selectedChart}
                  data={data}
                  xKey={labelField}
                  yKey={selectedFields[0]?.value}
                  zKey={zKey}
                  theme={theme}
                  render2DChart={render2DChart}
                />
              )
            ) : (
              <p className="text-center text-gray-500">Loading data or no data to display.</p>
            )}
          </div>

          {/* --- Export Buttons --- */}
          <div className="mt-6 flex space-x-2 flex-shrink-0">
            <button
              onClick={() => selectedChart === '3D Bar' ? chart3DBarRef.current?.exportPNG() : selectedChart === '3D Surface' ? chart3DSurfaceRef.current?.exportPNG() : exportToImage()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >Export as Image</button>
            <button
              onClick={() => selectedChart === '3D Bar' ? chart3DBarRef.current?.exportPDF() : selectedChart === '3D Surface' ? chart3DSurfaceRef.current?.exportPDF() : exportToPDF()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >Export as PDF</button>
            <button
              onClick={() => selectedChart === '3D Bar' ? chart3DBarRef.current?.exportCSV() : selectedChart === '3D Surface' ? chart3DSurfaceRef.current?.exportCSV() : handleExportCSV()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >Export as CSV</button>
          </div>
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default Analysis;