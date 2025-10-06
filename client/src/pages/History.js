// ✅ History.js — with View & Clean, secure token, admin check
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from "../components/MotionWrapper";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../utils/socket";

const CHART_TYPES = ["All", "Bar", "Pie", "Line", "3D Bar", "3D Surface", "3D Scatter"];

const History = () => {
  const [uploads, setUploads] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [chartTypeFilter, setChartTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("uploadedAt");
  const [sortDir, setSortDir] = useState("desc");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const attachLatestChartTypes = async (list) => {
    try {
      if (!Array.isArray(list) || list.length === 0) return [];
      const ids = list.map(u => u._id).join(',');
      const res = await axios.get(`/api/history/latest`, { params: { uploadIds: ids }, headers: { Authorization: `Bearer ${token}` } });
      const byId = new Map((res.data || []).map(r => [r.uploadId, r]));
      return list.map(u => {
        const meta = byId.get(u._id);
        return { ...u, latestChartType: meta?.chartType || null, latestChartAt: meta?.createdAt || null };
      });
    } catch {
      return Array.isArray(list) ? list : [];
    }
  };

  const fetchUserUploads = useCallback(async () => {
    try {
      const params = { page, limit, sort: sortBy, order: sortDir, search: search || undefined, from: from || undefined, to: to || undefined, chartType: chartTypeFilter };
      const res = await axios.get(`/api/uploads/user`, { headers: { Authorization: `Bearer ${token}` }, params });
      const data = res.data;
      const list = Array.isArray(data) ? data : (Array.isArray(data?.uploads) ? data.uploads : []);
      const enriched = await attachLatestChartTypes(list);
      setUploads(enriched);
      if (!Array.isArray(data)) { setTotal(data?.total || 0); setTotalPages(data?.totalPages || 1); } else { setTotal(enriched.length); setTotalPages(1); }
    } catch (err) {
      console.error("Error fetching uploads:", err);
      setUploads([]);
      setTotal(0);
      setTotalPages(1);
    }
  }, [page, limit, sortBy, sortDir, search, from, to, chartTypeFilter, token]);

  useEffect(() => {
    if (!token) {
      alert("Please login to view your history.");
      navigate("/login");
      return;
    }
    fetchUserUploads();

    try {
      const socket = getSocket();
      if (user?.id || user?._id) socket.emit('join:user', user.id || user._id);
      const refresh = () => fetchUserUploads();
      socket.on('uploads:added', refresh);
      socket.on('uploads:updated', refresh);
      socket.on('uploads:cleaned', refresh);
      socket.on('history:added', refresh);
      return () => {
        socket.off('uploads:added', refresh);
        socket.off('uploads:updated', refresh);
        socket.off('uploads:cleaned', refresh);
        socket.off('history:added', refresh);
      };
    } catch {}
  }, [fetchUserUploads, navigate, token]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  const handleClean = async (fileId) => {
    try {
      await axios.post(`/api/uploads/clean/${fileId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      navigate(`/clean/${fileId}`);
    } catch (err) {
      alert("❌ Cleaning failed");
    }
  };

  const safeUploads = Array.isArray(uploads) ? uploads : [];

  return (
    <SidebarLayout>
      <MotionWrapper>
        <div className="min-h-[85vh] bg-gray-100 dark:bg-gray-900 p-6 text-gray-800 dark:text-white">
          <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow p-6 rounded-md">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6">Your Upload History</h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Search</label>
                <input type="text" value={search} onChange={(e)=>{ setPage(1); setSearch(e.target.value); }} placeholder="File name..." className="border rounded px-2 py-1 w-40 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">From</label>
                <input type="date" value={from} onChange={(e)=>{ setPage(1); setFrom(e.target.value); }} className="border rounded px-2 py-1 w-40 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">To</label>
                <input type="date" value={to} onChange={(e)=>{ setPage(1); setTo(e.target.value); }} className="border rounded px-2 py-1 w-40 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Chart Type</label>
                <select value={chartTypeFilter} onChange={(e)=>{ setPage(1); setChartTypeFilter(e.target.value); }} className="border rounded px-2 py-1 w-44 dark:bg-gray-700 dark:text-white">
                  {CHART_TYPES.map(ct=> <option key={ct} value={ct}>{ct}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Page Size</label>
                <select value={limit} onChange={(e)=>{ setPage(1); setLimit(parseInt(e.target.value,10)); }} className="border rounded px-2 py-1 w-24 dark:bg-gray-700 dark:text-white">
                  {[10,20,50].map(n=> <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {safeUploads.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No uploads found.</p>
            ) : (
              <>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="overflow-x-auto mt-2 border border-blue-200 dark:border-blue-900 rounded shadow">
                  <table className="min-w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead>
                      <tr className="bg-blue-600 text-white text-sm">
                        <th className="px-4 py-2 border cursor-pointer" onClick={()=>toggleSort('name')}>
                          File Name {sortBy==='name' ? (sortDir==='asc' ? '▲' : '▼') : ''}
                        </th>
                        <th className="px-4 py-2 border">Size (KB)</th>
                        <th className="px-4 py-2 border cursor-pointer" onClick={()=>toggleSort('uploadedAt')}>
                          Uploaded At {sortBy==='uploadedAt' ? (sortDir==='asc' ? '▲' : '▼') : ''}
                        </th>
                        <th className="px-4 py-2 border">Latest Chart</th>
                        <th className="px-4 py-2 border text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeUploads.map((file) => (
                        <tr key={file._id} className="border-t hover:bg-blue-50 dark:hover:bg-blue-900">
                          <td className="px-4 py-2 border">{file.name}</td>
                          <td className="px-4 py-2 border">{Math.round((file.size || 0) / 1024)}</td>
                          <td className="px-4 py-2 border">{file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : '-'}</td>
                          <td className="px-4 py-2 border">{file.latestChartType || '—'}</td>
                          <td className="px-4 py-2 border text-center space-x-2">
                            <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }} onClick={() => navigate(`/viewer/${file._id}`)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow">🔍 View</motion.button>
                            {user?.role !== "admin" && (
                              <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }} onClick={() => handleClean(file._id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 shadow">🧼 Clean</motion.button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Prev</button>
                  {Array.from({length: totalPages}, (_,i)=>i+1).slice(Math.max(0,page-3), Math.min(totalPages, page+2)).map(p=> (
                    <button key={p} onClick={()=>setPage(p)} className={`px-3 py-1 rounded ${p===page ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>{p}</button>
                  ))}
                  <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Next</button>
                  <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">Total: {total}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default History;
