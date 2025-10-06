import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from '../components/MotionWrapper';
import { motion } from 'framer-motion';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
    localStorage.removeItem("recentUploadsByUser");
    localStorage.removeItem("adminUploads");
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!name.trim() || name.length < 3) newErrors.name = "Name must be at least 3 characters.";
    if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Enter a valid email.";
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password))
      newErrors.password = "Password must be 8+ chars, include uppercase, number & special char.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await axios.post('/api/auth/register', { name, email, password, role });
      toast.success("Registered successfully!");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <MotionWrapper>
        <div className="min-h-[85vh] flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/30 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-gray-700 text-black dark:text-white p-8 rounded-lg shadow-xl w-full max-w-md"
          >
            <h2 className="text-3xl font-semibold text-center text-green-600 dark:text-green-400 mb-6">
              Register
            </h2>

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Name */}
              <div>
                <div className="relative z-0 w-full group">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 text-black dark:text-white focus:outline-none focus:border-green-500 peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="name"
                    className="absolute text-sm text-gray-500 dark:text-gray-400 transform -translate-y-6 scale-75 top-2 z-10 origin-[0] left-0 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75"
                  >
                    Name
                  </label>
                </div>
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <div className="relative z-0 w-full group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 text-black dark:text-white focus:outline-none focus:border-green-500 peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="email"
                    className="absolute text-sm text-gray-500 dark:text-gray-400 transform -translate-y-6 scale-75 top-2 z-10 origin-[0] left-0 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75"
                  >
                    Email
                  </label>
                </div>
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="relative z-0 w-full group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 text-black dark:text-white focus:outline-none focus:border-green-500 peer"
                    placeholder=" "
                  />
                  <label
                    htmlFor="password"
                    className="absolute text-sm text-gray-500 dark:text-gray-400 transform -translate-y-6 scale-75 top-2 z-10 origin-[0] left-0 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75"
                  >
                    Password
                  </label>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Role */}
              <div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-600 text-sm text-black dark:text-white py-2 px-0 focus:outline-none focus:border-green-500"
                >
                  <option value="user" className="bg-white text-black dark:bg-gray-800 dark:text-white">User</option>
                  <option value="admin" className="bg-white text-black dark:bg-gray-800 dark:text-white">Admin</option>
                </select>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition flex justify-center items-center disabled:opacity-50"
                type="submit"
              >
                {loading ? <Spinner /> : "Register"}
              </motion.button>
            </form>

            <p className="mt-4 text-center text-sm dark:text-gray-300">
              Already registered?{" "}
              <span
                className="text-green-500 underline cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login here
              </span>
            </p>
          </motion.div>
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default Register;
