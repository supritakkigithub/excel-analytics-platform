// ✅ ExcelViewer.js — View parsed Excel table + navigate to chart analysis
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from "../components/MotionWrapper";
import { motion } from "framer-motion";

const ExcelViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [content, setContent] = useState([]);
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/uploads/content/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const validRows = res.data.filter(
          (row) => typeof row === "object" && Object.values(row).some(Boolean)
        );

        setContent(validRows);
        if (validRows.length > 0) {
          setHeaders(Object.keys(validRows[0]));
        }
      } catch (err) {
        console.error("Error fetching parsed content:", err);
      }
    };

    fetchData();
  }, [id]);

  return (
    <SidebarLayout>
      <MotionWrapper>
        <div className="min-h-[85vh] bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
          <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-xl p-6 rounded-lg transition">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4">
              🧾 Parsed Excel Content
            </h2>

            {content.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No content to display.</p>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-x-auto border border-blue-200 dark:border-blue-900 rounded-lg shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900 transition"
              >
                <table className="min-w-full text-sm text-left bg-white dark:bg-gray-800 border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      {headers.map((header, idx) => (
                        <th key={idx} className="px-4 py-2 border">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {content.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900 border-t"
                      >
                        {headers.map((header, colIndex) => (
                          <td key={colIndex} className="px-4 py-2 border">
                            {row[header] ?? "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* 📊 Chart View Button */}
            {content.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/analysis/${id}`)}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                📊 Analyze This File
              </motion.button>
            )}
          </div>
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default ExcelViewer;
