import React, { useState, useEffect } from 'react';
import { CloudRain, AlertCircle, MapPin, Wind, Gauge, Navigation, Clock, TrendingUp, History, Shield, Bell, Locate, Maximize2, X, Plus, Edit, Archive, Trash2, ChevronDown } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import WeatherWidget from '../components/weather/WeatherWidget';
import Alerts from './Alerts';
import TyphoonHistory from './History';
import TyphoonForm from '../components/typhoon/TyphoonForm';
import { typhoonAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { mockTyphoonData } from '../utils/helpers';

// Custom typhoon tracking map component
const TyphoonTrackingMap = ({ typhoon }) => {
  if (!typhoon || !typhoon.location) return null;

  const typhoonIcon = new L.Icon({
    iconUrl: '/typhoon_symbol/point2.png',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });

  const historicalIcon = new L.Icon({
    iconUrl: '/typhoon_symbol/point2.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
    opacity: 0.6
  });

  const pathCoordinates = typhoon.trackingPath?.map(point => [point.lat, point.lon]) || [];
  const center = [typhoon.location.lat, typhoon.location.lon];

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: '400px', width: '100%' }}
      className="rounded-lg"
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
      />

      {pathCoordinates.length > 1 && (
        <Polyline
          positions={pathCoordinates}
          color="#22d3ee"
          weight={3}
          opacity={0.8}
          dashArray="10, 10"
        />
      )}

      {typhoon.trackingPath?.map((point, index) => (
        <Marker
          key={`historical-${index}`}
          position={[point.lat, point.lon]}
          icon={historicalIcon}
        >
          <Popup>
            <div className="text-center">
              <h4 className="font-bold text-blue-600">Historical Position</h4>
              <p className="text-sm">Time: {point.time}</p>
              <p className="text-sm">Location: {point.lat.toFixed(1)}°, {point.lon.toFixed(1)}°</p>
            </div>
          </Popup>
        </Marker>
      ))}

      <Marker
        position={[typhoon.location.lat, typhoon.location.lon]}
        icon={typhoonIcon}
      >
        <Popup>
          <div className="text-center">
            <h4 className="font-bold text-red-600 animate-pulse">Current Typhoon Position</h4>
            <p className="text-sm font-semibold">{typhoon.name}</p>
            <p className="text-sm">Location: {typhoon.location.lat.toFixed(1)}°, {typhoon.location.lon.toFixed(1)}°</p>
            <p className="text-sm">Wind Speed: {typhoon.windSpeed} km/h</p>
            <p className="text-sm">Pressure: {typhoon.pressure} hPa</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

const TyphoonDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('current');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedTyphoon, setSelectedTyphoon] = useState(null);
  const [activeTyphoons, setActiveTyphoons] = useState([]);
  const [currentTyphoon, setCurrentTyphoon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTyphoonSelector, setShowTyphoonSelector] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const tabs = [
    { id: 'current', label: 'Current', icon: CloudRain },
    { id: 'tracking', label: 'Tracking', icon: Navigation },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'history', label: 'History', icon: History }
  ];

  // Fetch active typhoons
  const fetchActiveTyphoons = async () => {
    try {
      setLoading(true);
      const data = await typhoonAPI.getActive();
      setActiveTyphoons(data);
      
      // Set current typhoon to the first active one or use mock data
      if (data.length > 0) {
        setCurrentTyphoon(data[0]);
      } else {
        // Use mock data if no active typhoons
        setCurrentTyphoon(mockTyphoonData.current);
      }
    } catch (error) {
      console.error('Error fetching typhoons:', error);
      // Fallback to mock data on error
      setCurrentTyphoon(mockTyphoonData.current);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTyphoons();
  }, []);

  const handleCreateTyphoon = async (typhoonData) => {
    try {
      await typhoonAPI.create(typhoonData);
      await fetchActiveTyphoons();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating typhoon:', error);
      alert('Failed to create typhoon');
    }
  };

  const handleUpdateTyphoon = async (typhoonData) => {
    try {
      await typhoonAPI.update(selectedTyphoon.id, typhoonData);
      await fetchActiveTyphoons();
      setShowForm(false);
      setSelectedTyphoon(null);
    } catch (error) {
      console.error('Error updating typhoon:', error);
      alert('Failed to update typhoon');
    }
  };

  const handleArchiveTyphoon = async (typhoonId) => {
    try {
      await typhoonAPI.archive(typhoonId);
      await fetchActiveTyphoons();
    } catch (error) {
      console.error('Error archiving typhoon:', error);
      alert('Failed to archive typhoon');
    }
  };

  const handleDeleteTyphoon = async (typhoonId) => {
    try {
      await typhoonAPI.delete(typhoonId);
      await fetchActiveTyphoons();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting typhoon:', error);
      alert('Failed to delete typhoon');
    }
  };

  const openEditForm = (typhoon) => {
    setSelectedTyphoon(typhoon);
    setFormMode('edit');
    setShowForm(true);
  };

  const openCreateForm = () => {
    setSelectedTyphoon(null);
    setFormMode('create');
    setShowForm(true);
  };

  const typhoon = currentTyphoon || mockTyphoonData.current;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 mt-16">
      <Header title="Typhoon Dashboard" subtitle="Live Monitoring" showBack icon={CloudRain} />

      <main className="px-4 pt-4 pb-24">
        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Admin Controls
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={openCreateForm}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all"
                data-testid="create-typhoon-btn"
              >
                <Plus className="w-5 h-5" />
                Create New Typhoon
              </button>
              {currentTyphoon && currentTyphoon.id && (
                <>
                  <button
                    onClick={() => openEditForm(currentTyphoon)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                    data-testid="edit-typhoon-btn"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Current
                  </button>
                  <button
                    onClick={() => handleArchiveTyphoon(currentTyphoon.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all"
                    data-testid="archive-typhoon-btn"
                  >
                    <Archive className="w-5 h-5" />
                    Archive
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(currentTyphoon.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                    data-testid="delete-typhoon-btn"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Active Typhoons Selector */}
        {activeTyphoons.length > 1 && (
          <div className="mb-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="relative">
              <button
                onClick={() => setShowTyphoonSelector(!showTyphoonSelector)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <CloudRain className="w-5 h-5 text-cyan-400" />
                  <div className="text-left">
                    <p className="text-sm text-white/70">Selected Typhoon</p>
                    <p className="text-white font-semibold">{currentTyphoon?.name || 'Select Typhoon'}</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-white transition-transform ${showTyphoonSelector ? 'rotate-180' : ''}`} />
              </button>

              {showTyphoonSelector && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-blue-950 border border-white/10 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                  {activeTyphoons.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setCurrentTyphoon(t);
                        setShowTyphoonSelector(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-all border-b border-white/5 last:border-0 ${
                        currentTyphoon?.id === t.id ? 'bg-cyan-500/20' : ''
                      }`}
                    >
                      <p className="text-white font-semibold">{t.name}</p>
                      <p className="text-xs text-white/70">{t.category} - {t.as_of}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weather Widget */}
        <div className="mb-4">
          <WeatherWidget lat={13.0293} lon={123.445} />
        </div>

        {/* Image Viewer */}
        <div className="mb-4">
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-3">Satellite Image</h3>
            <div className="relative">
              <img
                src="https://src.meteopilipinas.gov.ph/repo/mtsat-colored/24hour/latest-him-colored.gif"
                alt="Typhoon Satellite Image"
                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setImageModalOpen(true)}
              />
              <button
                onClick={() => setImageModalOpen(true)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                title="Enlarge Image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-4 border border-white/10 overflow-x-auto">
          <div className="flex min-w-max space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-white/70 hover:text-white'
                  }`}
                  data-testid={`${tab.id}-tab`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'current' && (
          <div className="space-y-4">
            {/* Current Typhoon Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10" data-testid="typhoon-status-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <CloudRain className="w-10 h-10 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white" data-testid="typhoon-name">{typhoon.name}</h2>
                  <p className="text-cyan-400 text-sm">{typhoon.category}</p>
                  <p className="text-cyan-200 text-xs">{typhoon.as_of}</p>
                </div>
              </div>

              <p className="text-white/80 text-sm mb-4">{typhoon.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/70">Current Location</span>
                  </div>
                  <p className="text-lg font-bold text-white">{typhoon.near_location}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Locate className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/70">Location</span>
                  </div>
                  <p className="text-lg font-bold text-white">{typhoon.location.lat.toFixed(1)}°, {typhoon.location.lon.toFixed(1)}°</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/70">Wind Speed</span>
                  </div>
                  <p className="text-lg font-bold text-white">{typhoon.windSpeed} km/h</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/70">Pressure</span>
                  </div>
                  <p className="text-lg font-bold text-white">{typhoon.pressure} hPa</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/70">Direction</span>
                  </div>
                  <p className="text-lg font-bold text-white">{typhoon.direction}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/70">Speed</span>
                  </div>
                  <p className="text-lg font-bold text-white">{typhoon.speed} km/h</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-white">Affected Areas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {typhoon.affectedAreas?.map((area, index) => (
                    <span key={index} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Warnings */}
            <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-4 border border-red-500/20">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Public Storm Warning Signals
              </h3>
              <div className="space-y-2">
                {typhoon.warnings?.map((warning, index) => (
                  <div key={index} className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                    <p className="text-sm text-white/90">{warning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Preparedness */}
            <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-4 border border-green-500/20">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Preparedness Tips
              </h3>
              <div className="space-y-2">
                {typhoon.preparedness?.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-white/90">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="space-y-4">
            {/* Typhoon Tracking Map */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-cyan-400" />
                Typhoon Tracking Map
              </h3>

              {/* Map Container */}
              <div className="bg-white rounded-lg p-1">
                <TyphoonTrackingMap typhoon={typhoon} />
              </div>

              {/* Tracking Data */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/70">Total Distance</span>
                  </div>
                  <p className="text-lg font-bold text-white">{typhoon.totalDistance || 0} km</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/70">Tracking Time</span>
                  </div>
                  <p className="text-lg font-bold text-white">{typhoon.trackingTime || 0} hours</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/70">Next Update</span>
                  </div>
                  <p className="text-lg font-bold text-white">30 min</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forecast' && (
          <div className="space-y-4">
            {(typhoon.forecast || mockTyphoonData.forecast)?.map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">{item.time} Forecast</h3>
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                    {item.intensity}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Wind className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xs text-white/70">Wind</p>
                    <p className="text-sm font-bold text-white">{item.windSpeed} km/h</p>
                  </div>
                  <div className="text-center">
                    <Gauge className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xs text-white/70">Pressure</p>
                    <p className="text-sm font-bold text-white">{item.pressure} hPa</p>
                  </div>
                  <div className="text-center">
                    <MapPin className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xs text-white/70">Location</p>
                    <p className="text-xs font-bold text-white">{item.location.lat.toFixed(1)}°, {item.location.lon.toFixed(1)}°</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'alerts' && <Alerts />}

        {activeTab === 'history' && <TyphoonHistory />}
      </main>

      {/* Image Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute -top-12 right-0 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src="https://src.meteopilipinas.gov.ph/repo/mtsat-colored/24hour/latest-him-colored.gif"
              alt="Typhoon Satellite Image - Enlarged"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Typhoon Form Modal */}
      {showForm && (
        <TyphoonForm
          typhoon={selectedTyphoon}
          onSubmit={formMode === 'create' ? handleCreateTyphoon : handleUpdateTyphoon}
          onClose={() => {
            setShowForm(false);
            setSelectedTyphoon(null);
          }}
          mode={formMode}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl border border-red-500/20 p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Typhoon</h3>
                <p className="text-white/70 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-white/80 mb-6">
              Are you sure you want to permanently delete this typhoon data?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteTyphoon(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default TyphoonDashboard;
