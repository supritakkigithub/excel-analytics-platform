import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const DashboardOverview = lazy(() => import("./pages/DashboardOverview"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const UploadManagement = lazy(() => import("./pages/UploadManagement"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));

const AdminRoutes = () => (
  <Suspense fallback={<div className="p-8 text-center">Loading admin...</div>}>
    <Routes>
      <Route path="dashboard" element={<DashboardOverview />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="uploads" element={<UploadManagement />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="settings" element={<Settings />} />
      <Route path="logs" element={<AuditLogs />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </Suspense>
);

export default AdminRoutes; 