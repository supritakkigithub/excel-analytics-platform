// src/pages/ResetPassword.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from "../components/MotionWrapper";
import axios from "axios";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password });
      alert("Password reset successful!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <MotionWrapper>
        <div className="min-h-[85vh] flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/30 dark:bg-gray-800/40 p-8 rounded-lg shadow-xl max-w-md w-full border dark:border-gray-700 backdrop-blur-md"
          >
            <h2 className="text-2xl font-bold text-center text-green-600 dark:text-green-400 mb-6">
              Reset Your Password
            </h2>
            <form onSubmit={handleReset} className="space-y-6">
              <div className="relative z-0 w-full group">
                <input
                  type="password"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 appearance-none text-black dark:text-white focus:outline-none focus:ring-0 focus:border-green-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="password"
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  New Password
                </label>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Updating..." : "Reset Password"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default ResetPassword;
