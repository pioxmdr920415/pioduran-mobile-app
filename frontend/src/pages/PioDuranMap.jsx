import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, AlertCircle, Home, Hospital, Building, Bus, ShoppingCart, Pill, GraduationCap, Wifi, Trophy, Camera, Users, Calendar } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-measure/dist/leaflet-measure.css';
import L from 'leaflet';
import { setDefaultIcon, defaultIcon, selectedIcon } from '../utils/leafletIcons';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import { Switch } from '../components/ui/switch';
import WeatherWidget from '../components/weather/WeatherWidget';
import { Button } from '../components/ui/button';
import OfflineTileLayer from '../components/map/OfflineTileLayer';
import MapCacheControl from '../components/map/MapCacheControl';
import { useOnlineStatus } from '../hooks/usePWA';

// Mock data for locations in Pio Duran
const mockLocations = [
  { id: 1, lat: 13.0333, lng: 123.45, name: 'Pio Duran Municipal Hall', type: 'government', description: 'Main municipal office and emergency coordination center.', contact: '+63 123 456 7890' },
  { id: 2, lat: 13.035, lng: 123.455, name: 'Barangay 1 Evacuation Center', type: 'evacuation', description: 'Capacity: 200 people. Open 24/7 during emergencies.' },
  { id: 3, lat: 13.031, lng: 123.448, name: 'Pio Duran Rural Health Unit', type: 'medical', description: 'Primary healthcare facility with emergency services.', contact: '+63 123 456 7891' },
  { id: 4, lat: 13.037, lng: 123.452, name: 'Barangay 2 Hall', type: 'government', description: 'Local barangay office and community center.', contact: '+63 123 456 7892' },
  { id: 5, lat: 13.029, lng: 123.447, name: 'Central School Evacuation Site', type: 'evacuation', description: 'School gymnasium serving as evacuation center.' },
  { id: 6, lat: 13.041, lng: 123.458, name: 'Barangay 3 Health Station', type: 'medical', description: 'Basic medical services and first aid.', contact: '+63 123 456 7893' },
  // Transport
  { id: 7, lat: 13.032, lng: 123.449, name: 'Jeepney Stop - Main Road', type: 'transport', description: 'Public jeepney terminal with schedules.', schedule: '6AM-8PM' },
  { id: 8, lat: 13.036, lng: 123.453, name: 'Tricycle Stand', type: 'transport', description: 'Local tricycle service for short distances.' },
  // Markets
  { id: 9, lat: 13.034, lng: 123.451, name: 'Pio Duran Public Market', type: 'market', description: 'Fresh produce, fish, and local goods.' },
  { id: 10, lat: 13.038, lng: 123.456, name: 'Farming Cooperative', type: 'market', description: 'Agricultural products and cooperative services.' },
  // Health
  { id: 11, lat: 13.030, lng: 123.446, name: 'Local Pharmacy', type: 'pharmacy', description: 'Medicines and health supplies.', contact: '+63 123 456 7894' },
  { id: 12, lat: 13.039, lng: 123.457, name: 'Vaccination Site', type: 'vaccination', description: 'Ongoing vaccination drives for community health.' },
  // Education
  { id: 13, lat: 13.028, lng: 123.445, name: 'Pio Duran Central School', type: 'school', description: 'Primary and secondary education.', contact: '+63 123 456 7895' },
  { id: 14, lat: 13.040, lng: 123.459, name: 'Public Wi-Fi Zone', type: 'wifi', description: 'Free internet access for digital literacy.' },
  { id: 15, lat: 13.033, lng: 123.450, name: 'Basketball Court', type: 'sports', description: 'Community sports facility.' },
  // Tourism
  { id: 16, lat: 13.042, lng: 123.460, name: 'Local Beach', type: 'tourism', description: 'Scenic beach and tourist spot.' },
  { id: 17, lat: 13.027, lng: 123.444, name: 'Historical Church', type: 'tourism', description: 'Heritage site and local landmark.' },
  { id: 18, lat: 13.0355, lng: 123.454, name: 'Souvenir Shop', type: 'tourism', description: 'Local products and crafts.' },
  // Community
  { id: 19, lat: 13.0315, lng: 123.4485, name: 'Volunteer Cleanup Drive', type: 'volunteer', description: 'Join community cleanup efforts.', date: 'Every Saturday' },
  { id: 20, lat: 13.0375, lng: 123.4525, name: 'Community Fiesta', type: 'event', description: 'Annual town fiesta celebration.', date: 'May 15-20' },
];

// Mock evacuation routes
const evacuationRoutes = [
  [
    [13.0333, 123.45], // Municipal Hall
    [13.035, 123.455], // Evacuation Center 1
  ],
  [
    [13.0333, 123.45], // Municipal Hall
    [13.029, 123.447], // Evacuation Center 2
  ],
  [
    [13.0333, 123.45], // Municipal Hall
    [13.041, 123.458], // Health Station (can serve as route)
  ],
];

const PioDuranMap = () => {
  // Set default icons for React-Leaflet
  useEffect(() => {
    setDefaultIcon();
  }, []);

  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [filterType, setFilterType] = useState('all');

  const filteredLocations = filterType === 'all' ? mockLocations : mockLocations.filter(loc => loc.type === filterType);

  const getIcon = (type) => {
    switch (type) {
      case 'evacuation': return <Home className="w-6 h-6 text-blue-500" />;
      case 'medical': return <Hospital className="w-6 h-6 text-red-500" />;
      case 'government': return <Building className="w-6 h-6 text-green-500" />;
      case 'transport': return <Bus className="w-6 h-6 text-yellow-500" />;
      case 'market': return <ShoppingCart className="w-6 h-6 text-orange-500" />;
      case 'pharmacy': return <Pill className="w-6 h-6 text-purple-500" />;
      case 'vaccination': return <Hospital className="w-6 h-6 text-pink-500" />;
      case 'school': return <GraduationCap className="w-6 h-6 text-indigo-500" />;
      case 'wifi': return <Wifi className="w-6 h-6 text-cyan-500" />;
      case 'sports': return <Trophy className="w-6 h-6 text-lime-500" />;
      case 'tourism': return <Camera className="w-6 h-6 text-teal-500" />;
      case 'volunteer': return <Users className="w-6 h-6 text-emerald-500" />;
      case 'event': return <Calendar className="w-6 h-6 text-rose-500" />;
      default: return <Map className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 mt-16">
      <Header title="Pio Duran Map" subtitle="Interactive Map" showBack icon={Map} />

      <main id="main-content" className="px-4 pt-4 pb-24">
        {/* Offline Indicator */}
        {!isOnline && (
          <div className="bg-orange-500 text-white px-4 py-2 rounded-lg mb-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">You're offline. Showing cached map tiles.</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-4">
          <label className="text-white text-sm font-medium mb-2 block">Filter Locations:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter locations by type"
          >
            <option value="all">All Locations</option>
            <option value="evacuation">Evacuation Centers</option>
            <option value="medical">Medical Facilities</option>
            <option value="government">Government Offices</option>
            <option value="transport">Public Transport</option>
            <option value="market">Markets & Cooperatives</option>
            <option value="pharmacy">Pharmacies</option>
            <option value="vaccination">Vaccination Sites</option>
            <option value="school">Schools & Education</option>
            <option value="wifi">Wi-Fi Zones</option>
            <option value="sports">Sports Facilities</option>
            <option value="tourism">Tourist Spots</option>
            <option value="volunteer">Volunteer Opportunities</option>
            <option value="event">Community Events</option>
          </select>
        </div>

        {/* Weather Widget */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-4">
          <WeatherWidget lat={13.0293} lon={123.445} />
        </div>

        {/* Map Container */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-4">
          <MapContainer center={[13.0293, 123.445]} zoom={13} style={{ height: '400px', width: '100%' }} className="rounded-lg" aria-label="Interactive map of Pio Duran locations">
            <OfflineTileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapCacheControl />
            {filteredLocations.map(location => (
              <Marker key={location.id} position={[location.lat, location.lng]} icon={defaultIcon}>
                <Popup>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      {getIcon(location.type)}
                    </div>
                    <h3 className="font-bold text-lg">{location.name}</h3>
                    <p className="text-sm text-gray-600">{location.description}</p>
                    {location.contact && <p className="text-xs text-gray-500 mt-1">Contact: {location.contact}</p>}
                    {location.schedule && <p className="text-xs text-gray-500 mt-1">Schedule: {location.schedule}</p>}
                    {location.date && <p className="text-xs text-gray-500 mt-1">Date: {location.date}</p>}
                    <p className="text-xs text-gray-500 mt-1">Type: {location.type}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            {evacuationRoutes.map((route, index) => (
              <Polyline key={index} positions={route} color="red" weight={3} opacity={0.7} />
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-4">
          <h3 className="text-white font-bold mb-3">Legend</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-blue-500" />
              <span className="text-white text-sm">Evacuation</span>
            </div>
            <div className="flex items-center gap-3">
              <Hospital className="w-5 h-5 text-red-500" />
              <span className="text-white text-sm">Medical</span>
            </div>
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-green-500" />
              <span className="text-white text-sm">Government</span>
            </div>
            <div className="flex items-center gap-3">
              <Bus className="w-5 h-5 text-yellow-500" />
              <span className="text-white text-sm">Transport</span>
            </div>
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              <span className="text-white text-sm">Market</span>
            </div>
            <div className="flex items-center gap-3">
              <Pill className="w-5 h-5 text-purple-500" />
              <span className="text-white text-sm">Pharmacy</span>
            </div>
            <div className="flex items-center gap-3">
              <Hospital className="w-5 h-5 text-pink-500" />
              <span className="text-white text-sm">Vaccination</span>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              <span className="text-white text-sm">School</span>
            </div>
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-cyan-500" />
              <span className="text-white text-sm">Wi-Fi</span>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-lime-500" />
              <span className="text-white text-sm">Sports</span>
            </div>
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-teal-500" />
              <span className="text-white text-sm">Tourism</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-emerald-500" />
              <span className="text-white text-sm">Volunteer</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-rose-500" />
              <span className="text-white text-sm">Event</span>
            </div>
          </div>
        </div>

        {/* Report Hazard Button */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-4">
          <Button
            onClick={() => navigate('/report-incident')}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Report Hazard
          </Button>
        </div>

        <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/80">
              This map shows key locations for emergency preparedness. Always verify current conditions with local authorities.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default PioDuranMap;
