import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Activity, ShieldAlert, AlertOctagon } from 'lucide-react';
import ThreatCharts from '../components/ThreatCharts';
import WorldMap from '../components/WorldMap';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-slate-400 font-medium">{title}</h3>
      <div className="p-2 bg-slate-800 rounded-lg">
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
    </div>
    <div className="flex items-end gap-3">
      <span className="text-3xl font-bold text-white">{value}</span>
      {trend && (
        <span className="text-sm text-emerald-400 mb-1">{trend}</span>
      )}
    </div>
  </div>
);

const AdminDashboard = ({ token, alerts }) => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [statsRes, logsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/dashboard/stats', config),
        axios.get('http://localhost:5001/api/dashboard/logs', config)
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data periodically
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [token]);

  if (!stats) return <div className="p-8 text-slate-400 flex-1 flex items-center justify-center">Loading dashboard...</div>;

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
          <StatCard title="Total Login Attempts" value={stats.totalLogins} icon={Activity} />
          <StatCard title="Failed Logins" value={stats.failedLogins} icon={ShieldAlert} />
          <StatCard title="Active Alerts" value={stats.unresolvedAlerts} icon={AlertOctagon} />
        </div>

        {/* Charts & Map Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Authentication Trends (Last 7 Days)</h3>
            <div className="h-72">
              <ThreatCharts data={stats.loginTrends} />
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Origin of Requests</h3>
            <div className="flex-1 min-h-[300px] rounded-lg overflow-hidden border border-slate-800 relative z-0">
              <WorldMap logs={logs} />
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/50 text-slate-400">
                <tr>
                  <th className="p-3 rounded-tl-lg">Time</th>
                  <th className="p-3">User</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Location</th>
                  <th className="p-3 rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {logs.slice(0, 10).map((log, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-3">{log.username}</td>
                    <td className="p-3 font-mono text-xs">{log.ipAddress}</td>
                    <td className="p-3">{log.city !== 'Unknown' ? `${log.city}, ${log.country}` : log.country}</td>
                    <td className="p-3">
                      {log.success ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Success</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Failed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
