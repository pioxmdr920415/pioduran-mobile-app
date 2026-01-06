import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Camera, X, Send, Loader2, Locate, Map, WifiOff } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { setDefaultIcon, defaultIcon, selectedIcon } from '../utils/leafletIcons';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import { incidentTypes } from '../utils/helpers';
import axios from 'axios';
import offlineSync from '../services/offlineSync';
import { useOnlineStatus } from '../hooks/usePWA';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReportIncident = () => {
  const isOnline = useOnlineStatus();
  
  // Set default icons for React-Leaflet
  useEffect(() => {
    setDefaultIcon();
  }, []);

  const [formData, setFormData] = useState({
    incidentType: '',
    fullName: '',
    phoneNumber: '',
    description: '',
    images: [],
    location: null,
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: { lat: latitude, lon: longitude }
        }));

        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            address: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        } catch (err) {
          setFormData(prev => ({
            ...prev,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        }
        setLocationLoading(false);
      },
      (error) => {
        console.error('Location error:', error);
        alert('Unable to get your location. Please enable location services.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMapLocationSelect = async (coords) => {
    setFormData(prev => ({
      ...prev,
      location: { lat: coords.lat, lon: coords.lng }
    }));

    // Reverse geocoding to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
      );
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        address: data.display_name || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
      }));
    } catch (err) {
      setFormData(prev => ({
        ...prev,
        address: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
      }));
    }
  };

  // Map Click Handler Component
  const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        onLocationSelect({ lat, lng });
      }
    });
    return null;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(results => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...results].slice(0, 5) // Max 5 images
      }));
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.incidentType) newErrors.incidentType = 'Please select an incident type';
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length > 500) newErrors.description = 'Description must be 500 characters or less';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const reportData = {
        ...formData,
        timestamp: new Date().toISOString(),
        status: 'submitted'
      };

      if (isOnline) {
        // Online - submit directly
        try {
          await axios.post(`${API}/incidents`, reportData);
          setSubmitSuccess(true);
          setSubmitMessage('Report submitted successfully!');
        } catch (err) {
          console.error('Submit error:', err);
          // If network error, save offline
          if (!err.response) {
            await offlineSync.saveIncidentOffline(reportData);
            setSubmitSuccess(true);
            setSubmitMessage('You\'re offline. Report saved and will sync when connection is restored.');
          } else {
            throw err;
          }
        }
      } else {
        // Offline - save for later sync
        await offlineSync.saveIncidentOffline(reportData);
        setSubmitSuccess(true);
        setSubmitMessage('You\'re offline. Report saved and will sync when connection is restored.');
      }

      // Reset form after 4 seconds
      setTimeout(() => {
        setFormData({
          incidentType: '',
          fullName: '',
          phoneNumber: '',
          description: '',
          images: [],
          location: null,
          address: ''
        });
        setSubmitSuccess(false);
        setSubmitMessage('');
      }, 4000);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 mt-20">
        <Header title="Report Incident" showBack icon={AlertTriangle} />
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className={`w-20 h-20 ${isOnline ? 'bg-green-500' : 'bg-orange-500'} rounded-full flex items-center justify-center mb-6 animate-bounce`}>
            {isOnline ? (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <WifiOff className="w-10 h-10 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isOnline ? 'Report Submitted!' : 'Report Saved!'}
          </h2>
          <p className="text-white/70 text-center max-w-md">
            {submitMessage || 'Thank you for your report.'}
          </p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
      <Header title="Report Incident" subtitle="Submit Details" showBack icon={AlertTriangle} />

      <main id="main-content" className="px-4 pt-24 pb-24 space-y-4">
        {/* Incident Type */}
        <div>
          <label htmlFor="incident-type" className="block text-sm font-medium text-white mb-2">Incident Type *</label>
          <select
            id="incident-type"
            value={formData.incidentType}
            onChange={(e) => handleInputChange('incidentType', e.target.value)}
            className={`w-full p-3 rounded-xl bg-white/10 border ${errors.incidentType ? 'border-red-500' : 'border-white/20'} text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
          >
            <option value="" className="text-gray-900">Select incident type...</option>
            {incidentTypes.map((type) => (
              <option key={type} value={type} className="text-gray-900">{type}</option>
            ))}
          </select>
          {errors.incidentType && <p className="text-red-400 text-xs mt-1">{errors.incidentType}</p>}
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="full-name" className="block text-sm font-medium text-white mb-2">Full Name *</label>
            <input
              id="full-name"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className={`w-full p-3 rounded-xl bg-white/10 border ${errors.fullName ? 'border-red-500' : 'border-white/20'} text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
            {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="phone-number" className="block text-sm font-medium text-white mb-2">Phone Number (Optional)</label>
            <input
              id="phone-number"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="e.g., 09XX XXX XXXX"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-white mb-2" id="location-label">Location</label>

          {/* Map Section */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-3 mb-3" aria-labelledby="location-label">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">Select location on map or use GPS</span>
              <div className="flex gap-2">
                <button
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                  aria-label="Get current location using GPS"
                >
                  {locationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Locate className="w-4 h-4" aria-hidden="true" />
                  )}
                  GPS
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, location: null, address: '' }))}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                  aria-label="Clear selected location"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  Clear
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative h-48 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg overflow-hidden">
              {formData.location ? (
                <MapContainer
                  center={[formData.location.lat, formData.location.lon]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[formData.location.lat, formData.location.lon]} icon={selectedIcon}>
                    <Popup>
                      Selected Location<br />
                      {formData.address || `${formData.location.lat.toFixed(6)}, ${formData.location.lon.toFixed(6)}`}
                    </Popup>
                  </Marker>
                  <MapClickHandler onLocationSelect={handleMapLocationSelect} />
                </MapContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/50">
                  <div className="text-center">
                    <Map className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click map or use GPS to set location</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Display */}
          {formData.address && (
            <p className="text-sm text-yellow-500 bg-yellow-500/10 p-2 rounded-lg">
              <MapPin className="w-4 h-4 inline mr-1" />
              {formData.address}
            </p>
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-white mb-2" id="photos-label">Photos (Max 5)</label>
          <div className="grid grid-cols-4 gap-2" aria-labelledby="photos-label">
            {formData.images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <img src={img} alt={`Uploaded photo ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <X className="w-3 h-3 text-white" aria-hidden="true" />
                </button>
              </div>
            ))}
            {formData.images.length < 5 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                <Camera className="w-6 h-6 text-white/50 mb-1" aria-hidden="true" />
                <span className="text-xs text-white/50">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload photos"
                />
              </label>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
            Description * <span className="text-white/50">({formData.description.length}/500)</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the incident in detail..."
            rows={4}
            maxLength={500}
            className={`w-full p-3 rounded-xl bg-white/10 border ${errors.description ? 'border-red-500' : 'border-white/20'} text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none`}
          />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Report
            </>
          )}
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default ReportIncident;
