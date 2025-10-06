import axios from "axios";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from "../components/MotionWrapper";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const Upload = () => {
  const [data, setData] = useState([]);
  const [filename, setFilename] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token || !user) {
      toast.info("You must login first.");
      navigate("/login");
    }
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (parsedData.length === 0) {
          toast.error("No data found in file.");
          return;
        }

        setData(parsedData);
        toast.success("File parsed successfully!");

        const content = parsedData.slice(1).map((row) => {
          const obj = {};
          parsedData[0].forEach((key, i) => {
            obj[key] = row[i];
          });
          return obj;
        });

        await axios.post(
          "/api/uploads",
          {
            name: file.name,
            size: file.size,
            content,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (err) {
        console.error("❌ Upload Error:", err);
        toast.error("Error uploading to backend");
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <SidebarLayout>
      <MotionWrapper>
        <div className="min-h-[85vh] bg-gray-100 dark:bg-gray-900 p-6">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow p-6 rounded-md">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6">
              Upload Excel or CSV File
            </h2>

            <motion.label
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              htmlFor="upload-file"
              className="inline-block cursor-pointer bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
            >
              Choose File
            </motion.label>
            <input
              id="upload-file"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            {filename && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-3 text-sm text-blue-700 dark:text-blue-400 font-medium"
              >
                📄 Selected File: {filename}
              </motion.p>
            )}

            {data.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-x-auto mt-6 rounded-lg shadow-lg border border-blue-100 dark:border-blue-800 hover:shadow-xl transition"
              >
                <table className="min-w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-blue-500 text-white text-sm">
                      {data[0].map((cell, idx) => (
                        <th key={idx} className="px-4 py-2 border">
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t hover:bg-blue-50 dark:hover:bg-blue-900">
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="px-4 py-2 border">
                            {cell || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </div>
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default Upload;
