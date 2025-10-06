// src/components/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-blue-700 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate("/dashboard")}>
        Excel Analytics
      </h1>
      {user && (
        <div className="flex gap-4 items-center">
          <span>Hi, {user.name}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 px-3 py-1 rounded hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
