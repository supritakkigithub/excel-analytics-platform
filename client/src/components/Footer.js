// src/components/Footer.js
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white text-center py-3 mt-auto w-full">
    {/* <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-center py-4 text-sm"> */}
      © {new Date().getFullYear()} Excel Analytics Platform. All rights reserved.
    </footer>
  );
};

export default Footer;


