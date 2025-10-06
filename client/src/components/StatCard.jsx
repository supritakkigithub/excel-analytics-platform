// ✅ StatCard.jsx — with animated count & 3D glow
import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const StatCard = ({ title, value, icon: Icon, themeColor = "text-blue-500" }) => {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1.2 });
  const count = useTransform(spring, (latest) => Math.floor(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    motionValue.set(value);
    const unsubscribe = count.on("change", (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [value, motionValue, count]);

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 1 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-md hover:shadow-xl transform transition-all border border-gray-200 dark:border-gray-700 relative group overflow-hidden`}
    >
      {/* Glow Overlay */}
      <div
        className={`absolute inset-0 opacity-5 group-hover:opacity-20 ${themeColor}`}
        style={{ boxShadow: `0 0 80px currentColor` }}
      ></div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-700 dark:text-white">
            {title}
          </h4>
          <p className="text-3xl font-bold text-gray-900 dark:text-blue-100 mt-2">
            {displayValue}
          </p>
        </div>
        <div className="text-4xl opacity-30 group-hover:opacity-60 transition-all">
          <Icon className={`${themeColor}`} size={36} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
