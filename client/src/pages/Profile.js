import React, { useState } from "react";
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from "../components/MotionWrapper";
import axios from "axios";
import { motion } from "framer-motion";

const Profile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [name, setName] = useState(storedUser?.name || "");
  const [email] = useState(storedUser?.email || "");
  const [role] = useState(storedUser?.role || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await axios.put(
        "/api/users/update",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Profile updated!");
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <MotionWrapper>
        <div className="min-h-[85vh] flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-white dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-lg shadow-md border dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6 text-center">
              Your Profile
            </h2>

            {/* Floating Label Input */}
            <div className="relative mb-5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="peer w-full px-3 pt-5 pb-2 text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-transparent"
                placeholder="Name"
              />
              <label className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-500">
                Name
              </label>
            </div>

            <div className="relative mb-5">
              <input
                value={email}
                disabled
                className="peer w-full px-3 pt-5 pb-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md cursor-not-allowed"
                placeholder="Email"
              />
              <label className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400">
                Email
              </label>
            </div>

            <div className="relative mb-6">
              <input
                value={role}
                disabled
                className="peer w-full px-3 pt-5 pb-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md cursor-not-allowed"
                placeholder="Role"
              />
              <label className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400">
                Role
              </label>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={handleUpdate}
              disabled={loading}
              className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Update Profile"}
            </motion.button>
          </motion.div>
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default Profile;
