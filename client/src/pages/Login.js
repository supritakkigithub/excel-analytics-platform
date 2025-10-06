import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from '../components/MotionWrapper';
import { motion } from 'framer-motion';
import Spinner from '../components/Spinner';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.removeItem("recentUploadsByUser");

      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin-panel' : '/dashboard');
      alert("Login successful!");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
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
            <h2 className="text-3xl font-semibold text-center text-blue-600 dark:text-blue-400 mb-6">Login</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative z-0 w-full group">
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 appearance-none text-black dark:text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="email"
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Email
                </label>
              </div>

              <div className="relative z-0 w-full group">
                <input
                  type="password"
                  name="password"
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 appearance-none text-black dark:text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="password"
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Password
                </label>
              </div>

              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span
                  onClick={() => navigate("/forgot-password")}
                  className="cursor-pointer text-blue-500 hover:underline"
                >
                  Forgot password?
                </span>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex justify-center items-center disabled:opacity-50"
                type="submit"
              >
                {loading ? <Spinner /> : "Login"}
              </motion.button>
            </form>

            <p className="mt-4 text-center text-sm dark:text-gray-300">
              Don't have an account?{" "}
              <span
                className="text-blue-500 underline cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Register here
              </span>
            </p>
          </motion.div>
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default Login;
