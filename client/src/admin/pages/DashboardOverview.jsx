import React, { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout";
import axios from "axios";
import { getSocket } from "../../utils/socket";

const Line = ({ points, stroke = '#2563eb' }) => (
  <svg viewBox="0 0 100 40" className="w-full h-16">
    <polyline fill="none" stroke={stroke} strokeWidth="2" points={points.map((p,i)=>`${i*(100/(points.length-1))},${40 - (p.max? (p.value/p.max)*40 : (p/Math.max(...points))*40)}`).join(' ')} />
  </svg>
);

const DashboardOverview = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem('token');
  const [stats, setStats] = useState({ totalUsers: 0, totalUploads: 0, totalHistory: 0 });
  const [metrics, setMetrics] = useState({ uploadsByDay: [], activeUsersByDay: [], chartTypeCounts: {} });

  const fetchStats = async () => {
    const res = await axios.get('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` }});
    setStats(res.data);
  };
  const fetchMetrics = async () => {
    const res = await axios.get('/api/dashboard/metrics?range=30', { headers: { Authorization: `Bearer ${token}` }});
    setMetrics(res.data);
  };

  useEffect(() => {
    fetchStats();
    fetchMetrics();
    const socket = getSocket();
    socket.emit('join:admin');
    const refresh = () => { fetchStats(); fetchMetrics(); };
    socket.on('uploads:added', refresh);
    socket.on('uploads:cleaned', refresh);
    socket.on('history:added', refresh);
    return () => {
      socket.off('uploads:added', refresh);
      socket.off('uploads:cleaned', refresh);
      socket.off('history:added', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadsSeries = metrics.uploadsByDay.map(d => ({ date: d.date, value: d.count }));
  const activeSeries = metrics.activeUsersByDay.map(d => ({ date: d.date, value: d.count }));
  const maxU = Math.max(1, ...uploadsSeries.map(d=>d.value));
  const maxA = Math.max(1, ...activeSeries.map(d=>d.value));

  return (
    <AdminLayout title="Dashboard" breadcrumb="Admin / Dashboard" user={user}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-blue-900 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-200">{stats.totalUsers}</div>
          <div className="text-gray-600 dark:text-gray-300 mt-2">Total Users</div>
        </div>
        <div className="bg-white dark:bg-blue-900 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-200">{stats.totalUploads}</div>
          <div className="text-gray-600 dark:text-gray-300 mt-2">Uploads</div>
        </div>
        <div className="bg-white dark:bg-blue-900 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-200">{stats.totalHistory}</div>
          <div className="text-gray-600 dark:text-gray-300 mt-2">History Entries</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-blue-900 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-200">Uploads (30 days)</h2>
          <Line points={uploadsSeries.map(v=>({ value: v.value, max: maxU }))} stroke="#2563eb" />
        </div>
        <div className="bg-white dark:bg-blue-900 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-200">Active Users (30 days)</h2>
          <Line points={activeSeries.map(v=>({ value: v.value, max: maxA }))} stroke="#10b981" />
        </div>
      </div>

      <div className="bg-white dark:bg-blue-900 rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-200">Chart Usage</h2>
        <div className="flex flex-wrap gap-4">
          {Object.entries(metrics.chartTypeCounts).map(([k,v]) => (
            <div key={k} className="px-3 py-2 bg-blue-50 dark:bg-blue-800 rounded text-sm text-blue-800 dark:text-blue-100">{k}: {v}</div>
          ))}
          {Object.keys(metrics.chartTypeCounts).length === 0 && (
            <div className="text-gray-500">No data</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardOverview; 