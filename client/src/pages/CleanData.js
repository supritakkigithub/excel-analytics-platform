// ✅ CleanData.js — Step 1: View, Edit, Delete Excel Content
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from "../components/MotionWrapper";
import { motion } from "framer-motion";

const CleanData = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  // Fetch content from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/uploads/content/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const content = res.data;
        if (content.length === 0) {
          alert("No content found.");
          return;
        }

        setRows(content);
        setColumns(Object.keys(content[0]));
      } catch (err) {
        alert("Error loading content.");
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  // Rename a column
  const handleHeaderChange = (index, newLabel) => {
    const newColumns = [...columns];
    const oldKey = newColumns[index];
    newColumns[index] = newLabel;

    const updatedRows = rows.map((row) => {
      const newRow = { ...row };
      newRow[newLabel] = newRow[oldKey];
      delete newRow[oldKey];
      return newRow;
    });

    setColumns(newColumns);
    setRows(updatedRows);
  };

  const handleDeleteRow = (rowIndex) => {
    const updated = [...rows];
    updated.splice(rowIndex, 1);
    setRows(updated);
    alert("Row deleted.");
  };

  return (
    <SidebarLayout>
      <MotionWrapper>
        <div className="min-h-[85vh] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
          <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300">
              🧼 Clean & Edit Data
            </h2>

            {rows.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No data to display.</p>
            ) : (
              <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx} className="border px-3 py-2">
                        <input
                          type="text"
                          value={col}
                          onChange={(e) => handleHeaderChange(idx, e.target.value)}
                          className="bg-transparent text-white text-sm font-medium focus:outline-none border-b border-white"
                        />
                      </th>
                    ))}
                    <th className="border px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t hover:bg-blue-50 dark:hover:bg-blue-900 transition">
                      {columns.map((col, idx) => (
                        <td key={idx} className="px-3 py-2 border">
                          {row[col]}
                        </td>
                      ))}
                      <td className="px-3 py-2 border text-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-red-500 hover:text-red-700 text-sm"
                          onClick={() => handleDeleteRow(rowIndex)}
                        >
                          🗑️ Delete
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default CleanData;
