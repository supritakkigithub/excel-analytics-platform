import React from "react";
import SidebarLayout from "../components/SidebarLayout";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <SidebarLayout>
      <motion.div
        className="min-h-[85vh] flex flex-col justify-center items-center text-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
        <p className="text-xl mb-6">Oops! The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go to Home
        </button>
      </motion.div>
    </SidebarLayout>
  );
};

export default NotFound;
