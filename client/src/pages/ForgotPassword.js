// src/pages/ForgotPassword.js
import React, { useState } from "react";
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from "../components/MotionWrapper";
import axios from "axios";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      alert("Password reset link sent!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send reset link");
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
            <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6">
              Forgot Password?
            </h2>
            <form onSubmit={handleSendReset} className="space-y-6">
              <div className="relative z-0 w-full group">
                <input
                  type="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 appearance-none text-black dark:text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="email"
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Enter your registered email
                </label>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </motion.button>
            </form>
            <p className="mt-4 text-sm text-center dark:text-gray-300">
              Remember password?{" "}
              <span
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => window.location.href = "/login"}
              >
                Login
              </span>
            </p>
          </motion.div>
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default ForgotPassword;
