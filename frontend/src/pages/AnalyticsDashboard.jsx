import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, Users, AlertTriangle, Activity, 
  Download, RefreshCw, Calendar 
} from 'lucide-react';
import analyticsService from '../services/analyticsService';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [incidentData, setIncidentData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [systemData, setSystemData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
    
    // Refresh realtime data every 30 seconds
    const interval = setInterval(() => {
      loadRealtimeData();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboard, incidents, users, system, realtime] = await Promise.all([
        analyticsService.getDashboardAnalytics(timeRange),
        analyticsService.getIncidentAnalytics(timeRange),
        analyticsService.getUserAnalytics(timeRange),
        analyticsService.getSystemAnalytics(),
        analyticsService.getRealtimeMetrics()
      ]);

      setDashboardData(dashboard);
      setIncidentData(incidents);
      setUserData(users);
      setSystemData(system);
      setRealtimeData(realtime);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeData = async () => {
    try {
      const realtime = await analyticsService.getRealtimeMetrics();
      setRealtimeData(realtime);
    } catch (err) {
      console.error('Failed to load realtime data:', err);
    }
  };

  const handleExport = async () => {
    try {
      const data = await analyticsService.exportAnalytics(timeRange);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString()}.json`;
      a.click();
    } catch (err) {
      console.error('Failed to export analytics:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-800 font-semibold mb-2">Error Loading Analytics</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const incidentTypeData = incidentData?.by_type ? 
    Object.entries(incidentData.by_type).map(([name, value]) => ({ name, value })) : [];

  const incidentStatusData = incidentData?.by_status ? 
    Object.entries(incidentData.by_status).map(([name, value]) => ({ name, value })) : [];

  const dailyIncidentData = dashboardData?.incidents?.daily_trend ?
    Object.entries(dashboardData.incidents.daily_trend).map(([date, count]) => ({ date, count })) : [];

  const dailyUserActivityData = userData?.daily_registrations ?
    Object.entries(userData.daily_registrations).map(([date, users]) => ({ date, users })) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="analytics-dashboard">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive system metrics and insights</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="time-range-selector"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              data-testid="refresh-button"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              data-testid="export-button"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Realtime Metrics */}
      {realtimeData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Active Users"
            value={realtimeData.current?.active_users || 0}
            subtitle="Currently online"
            icon={<Users className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
          <MetricCard
            title="Recent Incidents"
            value={realtimeData.last_hour?.incidents || 0}
            subtitle="Last hour"
            icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
            color="orange"
          />
          <MetricCard
            title="System Activity"
            value={realtimeData.last_hour?.events || 0}
            subtitle="Events in last hour"
            icon={<Activity className="w-6 h-6 text-green-600" />}
            color="green"
          />
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Incidents"
          value={dashboardData?.overview?.total_incidents || 0}
          subtitle={`Last ${timeRange} days`}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          color="red"
        />
        <MetricCard
          title="New Users"
          value={dashboardData?.overview?.total_new_users || 0}
          subtitle={`Last ${timeRange} days`}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        <MetricCard
          title="Total Events"
          value={dashboardData?.overview?.total_events || 0}
          subtitle={`Last ${timeRange} days`}
          icon={<Activity className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <MetricCard
          title="Geotagged"
          value={dashboardData?.geographic?.geotagged_incidents || 0}
          subtitle="Incidents with location"
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Incident Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Incident Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyIncidentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Types */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Incidents by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incidentTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {incidentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Incident Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incidentStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Registrations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Registrations</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyUserActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Metrics */}
      {systemData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Database Storage</p>
              <p className="text-2xl font-bold text-blue-600">{systemData.database?.storage_mb?.toFixed(2)} MB</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-green-600">{systemData.counts?.total_users || 0}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
              <p className="text-2xl font-bold text-purple-600">{systemData.counts?.active_subscriptions || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    purple: 'bg-purple-50 border-purple-200'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div>{icon}</div>
      </div>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );
};

export default AnalyticsDashboard;
