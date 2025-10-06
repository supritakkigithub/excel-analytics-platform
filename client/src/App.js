// App.js
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import MotionWrapper from "./components/MotionWrapper";
import { ThemeProvider } from "./context/ThemeContext";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ExcelViewer from "./pages/ExcelViewer";
import Analysis from "./pages/Analysis";
import CleanSave from "./pages/CleanSave";
// Components
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Redirect from "./pages/Redirect";
import History from "./pages/History";
import Profile from "./pages/Profile";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MotionWrapper><Redirect /></MotionWrapper>} />
        <Route path="/register" element={<MotionWrapper><Register /></MotionWrapper>} />
        <Route path="/login" element={<MotionWrapper><Login /></MotionWrapper>} />
        <Route path="/dashboard" element={<PrivateRoute><MotionWrapper><Dashboard /></MotionWrapper></PrivateRoute>} />
        <Route path="/upload" element={<PrivateRoute><MotionWrapper><Upload /></MotionWrapper></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><MotionWrapper><History /></MotionWrapper></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><MotionWrapper><Profile /></MotionWrapper></PrivateRoute>} />
        <Route path="/admin-panel" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*" element={<MotionWrapper><NotFound /></MotionWrapper>} />
        <Route path="/forgot-password" element={<MotionWrapper><ForgotPassword /></MotionWrapper>} />
        <Route path="/reset-password/:token" element={<MotionWrapper><ResetPassword /></MotionWrapper>} />
        <Route path="/viewer/:id" element={<PrivateRoute><ExcelViewer /></PrivateRoute>} />
        <Route path="/analysis/:id" element={<PrivateRoute><Analysis /></PrivateRoute>} />
        <Route path="/clean/:id" element={<CleanSave />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          <AnimatedRoutes />
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
