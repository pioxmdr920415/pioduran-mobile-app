import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { incidentAPI, typhoonAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Filter,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  CloudRain,
  Archive,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    inProgress: 0,
    resolved: 0,
    avgResponseTime: 0,
  });
  const [typhoons, setTyphoons] = useState([]);
  const [typhoonLoading, setTyphoonLoading] = useState(true);
  const [selectedTyphoon, setSelectedTyphoon] = useState(null);
  const [showTyphoonDetailModal, setShowTyphoonDetailModal] = useState(false);
  const [showTyphoonEditModal, setShowTyphoonEditModal] = useState(false);
  const [typhoonEditData, setTyphoonEditData] = useState({});
  const [typhoonStats, setTyphoonStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    fetchIncidents();
    fetchTyphoons();
  }, [user, navigate]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      console.log('Fetching incidents...');
      const data = await incidentAPI.getAll();
      console.log('Incidents fetched:', data.length, 'incidents');
      setIncidents(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch incidents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (incidentData) => {
    const total = incidentData.length;
    const submitted = incidentData.filter(i => i.status === 'submitted').length;
    const inProgress = incidentData.filter(i => i.status === 'in-progress').length;
    const resolved = incidentData.filter(i => i.status === 'resolved').length;

    // Calculate average response time (mock calculation)
    const avgResponseTime = incidentData.length > 0 ? 15 : 0; // Mock: 15 minutes

    setStats({ total, submitted, inProgress, resolved, avgResponseTime });
  };
  
  const calculateTyphoonStats = (typhoonData) => {
    const total = typhoonData.length;
    const active = typhoonData.filter(t => t.status === 'active').length;
    const inactive = typhoonData.filter(t => t.status === 'inactive').length;
    setTyphoonStats({ total, active, inactive });
  };
  
  const fetchTyphoons = async () => {
    try {
      setTyphoonLoading(true);
      const data = await typhoonAPI.getAll();
      setTyphoons(data);
      calculateTyphoonStats(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch typhoons",
        variant: "destructive",
      });
    } finally {
      setTyphoonLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateIncident = async () => {
    try {
      await incidentAPI.update(selectedIncident.id, editData);
      toast({
        title: "Success",
        description: "Incident updated successfully",
      });
      setShowEditModal(false);
      fetchIncidents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update incident",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIncident = async (incidentId) => {
    if (!window.confirm('Are you sure you want to delete this incident?')) return;

    try {
      await incidentAPI.delete(incidentId);
      toast({
        title: "Success",
        description: "Incident deleted successfully",
      });
      fetchIncidents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete incident",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateTyphoon = async () => {
    try {
      await typhoonAPI.update(selectedTyphoon.id, typhoonEditData);
      toast({
        title: "Success",
        description: "Typhoon updated successfully",
      });
      setShowTyphoonEditModal(false);
      fetchTyphoons();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update typhoon",
        variant: "destructive",
      });
    }
  };
  
  const handleArchiveTyphoon = async (typhoonId) => {
    if (!window.confirm('Are you sure you want to archive this typhoon?')) return;
    try {
      await typhoonAPI.archive(typhoonId);
      toast({
        title: "Success",
        description: "Typhoon archived successfully",
      });
      fetchTyphoons();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive typhoon",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteTyphoon = async (typhoonId) => {
    if (!window.confirm('Are you sure you want to delete this typhoon?')) return;
    try {
      await typhoonAPI.delete(typhoonId);
      toast({
        title: "Success",
        description: "Typhoon deleted successfully",
      });
      fetchTyphoons();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete typhoon",
        variant: "destructive",
      });
    }
  };
  
  const openTyphoonEditModal = (typhoon) => {
    setSelectedTyphoon(typhoon);
    setTyphoonEditData({
      name: typhoon.name,
      category: typhoon.category,
      status: typhoon.status,
      description: typhoon.description,
    });
    setShowTyphoonEditModal(true);
  };
  
  const openTyphoonDetailModal = (typhoon) => {
    setSelectedTyphoon(typhoon);
    setShowTyphoonDetailModal(true);
  };
  
  const openEditModal = (incident) => {
    setSelectedIncident(incident);
    setEditData({
      status: incident.status,
      priority: incident.priority,
      assigned_to: incident.assigned_to || '',
      notes: incident.notes || '',
    });
    setShowEditModal(true);
  };

  const openDetailModal = (incident) => {
    setSelectedIncident(incident);
    setShowDetailModal(true);
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || incident.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-500';
      case 'in-progress': return 'bg-purple-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'typhoons', label: 'Typhoons', icon: CloudRain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate" data-testid="admin-dashboard-title">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, <span className="font-medium">{user?.username}</span></p>
            </div>
            <Button variant="outline" onClick={handleLogout} data-testid="logout-button" className="flex-shrink-0">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1600px] mx-auto border-t">
          <div className="flex space-x-1 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`tab-${tab.id}`}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow" data-testid="stat-total-incidents">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1.5">Total Incidents</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{stats.total}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow" data-testid="stat-submitted">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1.5">Submitted</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600 truncate">{stats.submitted}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow" data-testid="stat-in-progress">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1.5">In Progress</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600 truncate">{stats.inProgress}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow" data-testid="stat-resolved">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1.5">Resolved</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 truncate">{stats.resolved}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow" data-testid="stat-response-time">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1.5">Avg Response Time</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600 truncate">
                      {stats.avgResponseTime}<span className="text-base sm:text-lg text-gray-600 ml-1">min</span>
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Typhoon Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow" data-testid="stat-total-typhoons">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1.5">Total Typhoons</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{typhoonStats.total}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <CloudRain className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow" data-testid="stat-active-typhoons">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1.5">Active Typhoons</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 truncate">{typhoonStats.active}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow" data-testid="stat-inactive-typhoons">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1.5">Inactive Typhoons</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-600 truncate">{typhoonStats.inactive}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Archive className="w-7 h-7 sm:w-8 sm:h-8 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Incidents */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-5 sm:px-6 py-4 sm:py-5 border-b">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Incidents</h2>
              </div>
              <div className="p-5 sm:p-6">
                {loading ? (
                  <p className="text-center text-gray-600 py-8">Loading...</p>
                ) : incidents.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No incidents found</p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {incidents.slice(0, 5).map((incident) => (
                      <div key={incident.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                            <Badge className={getPriorityColor(incident.priority)}>
                              {incident.priority}
                            </Badge>
                            <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{incident.incidentType}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1.5 line-clamp-2">{incident.description}</p>
                          <p className="text-xs text-gray-500">Reported by: <span className="font-medium">{incident.fullName}</span></p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openDetailModal(incident)} className="flex-shrink-0 w-full sm:w-auto">
                          <Eye className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Incidents Tab */}
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search incidents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="search-incidents"
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger data-testid="filter-status">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger data-testid="filter-priority">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={fetchIncidents} data-testid="refresh-incidents" className="w-full">
                  Refresh
                </Button>
              </div>
            </div>

            {/* Incidents Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reporter
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-4 sm:px-6 py-8 text-center text-gray-600">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredIncidents.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 sm:px-6 py-8 text-center text-gray-600">
                          No incidents found
                        </td>
                      </tr>
                    ) : (
                      filteredIncidents.map((incident) => (
                        <tr key={incident.id} className="hover:bg-gray-50 transition-colors" data-testid={`incident-row-${incident.id}`}>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 mb-1">{incident.incidentType}</div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[200px]">{incident.description}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 mb-0.5">{incident.fullName}</div>
                            <div className="text-xs text-gray-500">{incident.phoneNumber}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <Badge className={getPriorityColor(incident.priority)}>
                              {incident.priority}
                            </Badge>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(incident.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openDetailModal(incident)} data-testid={`view-incident-${incident.id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openEditModal(incident)} data-testid={`edit-incident-${incident.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteIncident(incident.id)} data-testid={`delete-incident-${incident.id}`}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Typhoons Tab */}
        {activeTab === 'typhoons' && (
          <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Typhoon Management</h2>
                <Button onClick={fetchTyphoons} data-testid="refresh-typhoons" className="w-full sm:w-auto">
                  Refresh
                </Button>
              </div>
            </div>
            {/* Typhoons Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {typhoonLoading ? (
                      <tr>
                        <td colSpan="6" className="px-4 sm:px-6 py-8 text-center text-gray-600">
                          Loading...
                        </td>
                      </tr>
                    ) : typhoons.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 sm:px-6 py-8 text-center text-gray-600">
                          No typhoons found
                        </td>
                      </tr>
                    ) : (
                      typhoons.map((typhoon) => (
                        <tr key={typhoon.id} className="hover:bg-gray-50 transition-colors" data-testid={`typhoon-row-${typhoon.id}`}>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 mb-0.5">{typhoon.name}</div>
                            <div className="text-xs text-gray-500">{typhoon.as_of}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{typhoon.category}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <Badge className={typhoon.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                              {typhoon.status}
                            </Badge>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-[200px] truncate">{typhoon.near_location}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(typhoon.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openTyphoonDetailModal(typhoon)} data-testid={`view-typhoon-${typhoon.id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openTyphoonEditModal(typhoon)} data-testid={`edit-typhoon-${typhoon.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              {typhoon.status === 'active' ? (
                                <Button variant="ghost" size="sm" onClick={() => handleArchiveTyphoon(typhoon.id)} data-testid={`archive-typhoon-${typhoon.id}`}>
                                  <Archive className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteTyphoon(typhoon.id)} data-testid={`delete-typhoon-${typhoon.id}`}>
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-8 sm:p-10 rounded-lg shadow-sm border">
              <div className="text-center max-w-2xl mx-auto">
                <BarChart3 className="w-14 h-14 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Advanced Analytics</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  View comprehensive analytics with detailed charts and metrics
                </p>
                <Button 
                  onClick={() => navigate('/analytics')}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  data-testid="view-analytics-button"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Open Analytics Dashboard
                </Button>
              </div>
            </div>
            
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-5 sm:mb-6">Quick Stats</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 sm:mb-4">Status Distribution</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-600">Submitted</span>
                        <span className="text-sm font-medium">{stats.submitted} ({stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-600">In Progress</span>
                        <span className="text-sm font-medium">{stats.inProgress} ({stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-600">Resolved</span>
                        <span className="text-sm font-medium">{stats.resolved} ({stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 sm:mb-4">Key Metrics</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Response Time</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.avgResponseTime} <span className="text-sm text-gray-600">min</span></p>
                      </div>
                      <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0 ml-3" />
                    </div>
                    <div className="flex items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Resolution Rate</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</p>
                      </div>
                      <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-green-500 flex-shrink-0 ml-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white p-8 sm:p-10 rounded-lg shadow-sm border">
              <div className="text-center max-w-2xl mx-auto">
                <Settings className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Settings</h2>
                <p className="text-sm sm:text-base text-gray-600">Admin settings coming soon...</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Incident Details</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Type</Label>
                  <p className="font-medium text-sm sm:text-base">{selectedIncident.incidentType}</p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedIncident.status)}>
                      {selectedIncident.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Priority</Label>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(selectedIncident.priority)}>
                      {selectedIncident.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Date</Label>
                  <p className="font-medium text-sm sm:text-base">{new Date(selectedIncident.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Reporter</Label>
                <p className="font-medium text-sm sm:text-base">{selectedIncident.fullName}</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{selectedIncident.phoneNumber}</p>
              </div>

              <div>
                <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Description</Label>
                <p className="text-sm leading-relaxed">{selectedIncident.description}</p>
              </div>

              {selectedIncident.address && (
                <div>
                  <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Address</Label>
                  <p className="text-sm flex items-start gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{selectedIncident.address}</span>
                  </p>
                </div>
              )}

              {selectedIncident.location && (
                <div>
                  <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Coordinates</Label>
                  <p className="text-sm">
                    Lat: {selectedIncident.location.lat}, Lon: {selectedIncident.location.lon}
                  </p>
                </div>
              )}

              {selectedIncident.images && selectedIncident.images.length > 0 && (
                <div>
                  <Label className="text-xs sm:text-sm text-gray-600 mb-2 block">Images</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {selectedIncident.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Incident ${idx + 1}`} className="w-full h-24 sm:h-28 object-cover rounded-lg border" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Incident</DialogTitle>
            <DialogDescription className="text-sm">Update incident status, priority, or assignment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status" className="text-sm font-medium mb-1.5 block">Status</Label>
              <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                <SelectTrigger id="status" data-testid="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority" className="text-sm font-medium mb-1.5 block">Priority</Label>
              <Select value={editData.priority} onValueChange={(value) => setEditData({ ...editData, priority: value })}>
                <SelectTrigger id="priority" data-testid="edit-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assigned_to" className="text-sm font-medium mb-1.5 block">Assign To</Label>
              <Input
                id="assigned_to"
                value={editData.assigned_to}
                onChange={(e) => setEditData({ ...editData, assigned_to: e.target.value })}
                placeholder="Responder username"
                data-testid="edit-assigned-to"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium mb-1.5 block">Notes</Label>
              <Textarea
                id="notes"
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                placeholder="Add notes..."
                rows={3}
                data-testid="edit-notes"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateIncident} data-testid="save-incident">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Typhoon Detail Modal */}
      <Dialog open={showTyphoonDetailModal} onOpenChange={setShowTyphoonDetailModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Typhoon Details</DialogTitle>
          </DialogHeader>
          {selectedTyphoon && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Name</Label>
                  <p className="font-medium text-sm sm:text-base">{selectedTyphoon.name}</p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Category</Label>
                  <p className="font-medium text-sm sm:text-base">{selectedTyphoon.category}</p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Status</Label>
                  <div className="mt-1">
                    <Badge className={selectedTyphoon.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                      {selectedTyphoon.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">As Of</Label>
                  <p className="font-medium text-sm sm:text-base">{selectedTyphoon.as_of}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Location</Label>
                <p className="font-medium text-sm sm:text-base">{selectedTyphoon.near_location}</p>
              </div>

              {selectedTyphoon.description && (
                <div>
                  <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Description</Label>
                  <p className="text-sm leading-relaxed">{selectedTyphoon.description}</p>
                </div>
              )}

              <div>
                <Label className="text-xs sm:text-sm text-gray-600 mb-1 block">Created</Label>
                <p className="text-sm">{new Date(selectedTyphoon.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Typhoon Edit Modal */}
      <Dialog open={showTyphoonEditModal} onOpenChange={setShowTyphoonEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Typhoon</DialogTitle>
            <DialogDescription className="text-sm">Update typhoon information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="typhoon-name" className="text-sm font-medium mb-1.5 block">Name</Label>
              <Input
                id="typhoon-name"
                value={typhoonEditData.name || ''}
                onChange={(e) => setTyphoonEditData({ ...typhoonEditData, name: e.target.value })}
                placeholder="Typhoon name"
              />
            </div>

            <div>
              <Label htmlFor="typhoon-category" className="text-sm font-medium mb-1.5 block">Category</Label>
              <Input
                id="typhoon-category"
                value={typhoonEditData.category || ''}
                onChange={(e) => setTyphoonEditData({ ...typhoonEditData, category: e.target.value })}
                placeholder="Category"
              />
            </div>

            <div>
              <Label htmlFor="typhoon-status" className="text-sm font-medium mb-1.5 block">Status</Label>
              <Select 
                value={typhoonEditData.status} 
                onValueChange={(value) => setTyphoonEditData({ ...typhoonEditData, status: value })}
              >
                <SelectTrigger id="typhoon-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="typhoon-description" className="text-sm font-medium mb-1.5 block">Description</Label>
              <Textarea
                id="typhoon-description"
                value={typhoonEditData.description || ''}
                onChange={(e) => setTyphoonEditData({ ...typhoonEditData, description: e.target.value })}
                placeholder="Typhoon description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowTyphoonEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTyphoon}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
