// Dashboard.js
import React, { useEffect, useState } from "react";
import SidebarLayout from "../components/SidebarLayout";
import StatCard from "../components/StatCard";
import { CloudUpload, Users, History } from "lucide-react";
import Spinner from "../components/Spinner";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <SidebarLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="col-span-3 text-red-500">{error}</div>
        ) : (
          <>
        <StatCard
          title="Total Uploads"
              value={stats?.totalUploads || 0}
          icon={CloudUpload}
          themeColor="text-blue-400"
        />
        <StatCard
          title="Users"
              value={stats?.totalUsers || 0}
          icon={Users}
          themeColor="text-green-400"
        />
        <StatCard
          title="History"
              value={stats?.totalHistory || 0}
          icon={History}
          themeColor="text-yellow-400"
        />
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
