// ✅ Enhanced ExcelCleanViewer.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from "../components/MotionWrapper";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';

const CleanSave = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [editedData, setEditedData] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCleaned = async () => {
      try {
        const res = await axios.get(`/api/uploads/cleaned/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
        setEditedData(res.data);
      } catch (err) {
        console.error("Error fetching cleaned data", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchCleaned();
  }, [id]);

  const handleChange = (rowIndex, key, value) => {
    const updated = [...editedData];
    updated[rowIndex][key] = value;
    setEditedData(updated);
  };

 const handleSave = async () => {
  try {
    await axios.put(`/api/uploads/${id}`, { content: editedData }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("✅ Data saved successfully!");
    navigate("/history");
  } catch (err) {
    console.error("Save error", err);
    toast.error("Failed to save changes.");
  }
};


  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const filteredData = editedData.filter((row) => {
    return Object.keys(filters).every((key) => {
      const filterVal = filters[key]?.toLowerCase() || "";
      const cellVal = String(row[key] ?? "").toLowerCase();
      return cellVal.includes(filterVal);
    });
  });

  const handleExportCSV = () => {
    if (!editedData || editedData.length === 0) return;

    const headers = Object.keys(editedData[0]);
    const rows = editedData.map(row => headers.map(h => `"${row[h]}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cleaned_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <SidebarLayout>
      <MotionWrapper>
        <div className="min-h-[85vh] bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
          <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                🧹 Clean & Edit Data with Filters
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/history")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded shadow"
              >
                ⬅ Back to History
              </motion.button>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : editedData.length === 0 ? (
              <p>No data found.</p>
            ) : (
              <>
                {/* ✅ Filters */}
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6"
                >
                  {Object.keys(editedData[0]).map((key) => (
                    <div key={key} className="flex flex-col">
                      <label className="text-sm font-medium mb-1">{key}</label>
                      <input
                        type="text"
                        placeholder={`Filter ${key}`}
                        value={filters[key] || ""}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-sm"
                      />
                    </div>
                  ))}
                </motion.div>

                {/* ✅ Editable Table */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-x-auto rounded border border-gray-300 dark:border-gray-700 shadow-sm"
                >
                  <table className="min-w-full text-sm bg-white dark:bg-gray-800 border">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        {Object.keys(editedData[0]).map((key) => (
                          <th key={key} className="px-5 py-2 border">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900 transition"
                        >
                          {Object.entries(row).map(([key, value], colIndex) => (
                            <td key={colIndex} className="px-2 py-1 border">
                              <input
                                className="w-full bg-transparent text-sm px-2 py-1 outline-none dark:text-white"
                                value={value}
                                onChange={(e) =>
                                  handleChange(rowIndex, key, e.target.value)
                                }
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>

                {/* ✅ Save Button */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow"
                >
                  💾 Save Cleaned Data
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleExportCSV}
                  className="mt-3 ml-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded shadow transition"
                >
                  📤 Export CSV
                </motion.button>

              </>
            )}
          </div>
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default CleanSave;
