// src/pages/CleanPreview.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from "../components/MotionWrapper";
import axios from "axios";
import { motion } from "framer-motion";

const CleanPreview = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchCleanedData = async () => {
      try {
        const res = await axios.get(`/api/uploads/cleaned/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRows(res.data);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchCleanedData();
  }, [id]);

  if (rows.length === 0) {
    return (
      <SidebarLayout>
        <MotionWrapper>
          <div className="min-h-[85vh] flex items-center justify-center text-gray-600 dark:text-gray-300">
            <p>No cleaned data available.</p>
          </div>
        </MotionWrapper>
      </SidebarLayout>
    );
  }

  const headers = Object.keys(rows[0]);

  return (
    <SidebarLayout>
      <MotionWrapper>
        <div className="min-h-[85vh] bg-gray-100 dark:bg-gray-900 p-6">
          <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow p-6 rounded-md overflow-x-auto">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4">
              🧹 Cleaned Data Preview
            </h2>

            <table className="min-w-full border text-sm">
              <thead className="bg-blue-500 text-white">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-2 border">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-t hover:bg-blue-50 dark:hover:bg-blue-900"
                  >
                    {headers.map((key, i) => (
                      <td key={i} className="px-4 py-2 border">
                        {row[key] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default CleanPreview;
