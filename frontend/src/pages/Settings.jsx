import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import NotificationSettings from '../components/notifications/NotificationSettings';
import PWASettings from '../components/pwa/PWASettings';
import OfflineMapSettings from '../components/settings/OfflineMapSettings';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import {
  User,
  Bell,
  MapPin,
  Palette,
  Phone,
  Shield,
  Accessibility,
  Info,
  Save,
  ArrowLeft
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Settings state
  const [settings, setSettings] = useState({
    // Notifications
    typhoonAlerts: true,
    weatherAlerts: true,
    incidentAlerts: true,
    pushNotifications: true,

    // Location
    gpsEnabled: true,
    locationSharing: false,

    // Appearance
    darkMode: false,
    language: 'en',

    // Emergency Contacts
    emergencyContacts: [],

    // Privacy
    dataSharing: false,
    analytics: true,

    // Accessibility
    highContrast: false,
    largeText: false,
    reducedMotion: false
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    // Show success message or toast
    alert('Settings saved successfully!');
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addEmergencyContact = () => {
    setSettings(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', phone: '', relationship: '' }]
    }));
  };

  const updateEmergencyContact = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const removeEmergencyContact = (index) => {
    setSettings(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
      <Header
        title="Settings"
        subtitle="Customize your experience"
        showBack={true}
        icon={User}
      />

      <main id="main-content" className="px-6 pt-24 pb-28">
        <div className="max-w-4xl mx-auto space-y-5">

          {/* Push Notification Settings - Enhanced */}
          {user && <NotificationSettings userId={user.id} />}

          {/* PWA & Offline Settings */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600" />
                Offline & Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PWASettings />
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {user ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Username</Label>
                    <p className="text-sm text-gray-600 mt-1">{user.username}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/change-password')}
                  >
                    Change Password
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-3">Login to access account settings</p>
                  <Button onClick={() => navigate('/login')}>
                    Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="typhoon-alerts" className="text-sm font-medium">
                  Typhoon Alerts
                </Label>
                <Switch
                  id="typhoon-alerts"
                  checked={settings.typhoonAlerts}
                  onCheckedChange={(checked) => updateSetting('typhoonAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="weather-alerts" className="text-sm font-medium">
                  Weather Alerts
                </Label>
                <Switch
                  id="weather-alerts"
                  checked={settings.weatherAlerts}
                  onCheckedChange={(checked) => updateSetting('weatherAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="incident-alerts" className="text-sm font-medium">
                  Incident Reports
                </Label>
                <Switch
                  id="incident-alerts"
                  checked={settings.incidentAlerts}
                  onCheckedChange={(checked) => updateSetting('incidentAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-sm font-medium">
                  Push Notifications
                </Label>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="gps-enabled" className="text-sm font-medium">
                  GPS Location
                </Label>
                <Switch
                  id="gps-enabled"
                  checked={settings.gpsEnabled}
                  onCheckedChange={(checked) => updateSetting('gpsEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="location-sharing" className="text-sm font-medium">
                  Location Sharing
                </Label>
                <Switch
                  id="location-sharing"
                  checked={settings.locationSharing}
                  onCheckedChange={(checked) => updateSetting('locationSharing', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="text-sm font-medium">
                  Dark Mode
                </Label>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                />
              </div>
              <div>
                <Label htmlFor="language-select" className="text-sm font-medium">Language</Label>
                <select
                  id="language-select"
                  className="w-full mt-2 p-2 border rounded-md"
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="tl">Filipino</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.emergencyContacts.map((contact, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Contact {index + 1}</Label>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeEmergencyContact(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor={`contact-name-${index}`} className="text-sm font-medium">Name</Label>
                    <Input
                      id={`contact-name-${index}`}
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`contact-phone-${index}`} className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id={`contact-phone-${index}`}
                      placeholder="Phone Number"
                      value={contact.phone}
                      onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`contact-relationship-${index}`} className="text-sm font-medium">Relationship</Label>
                    <Input
                      id={`contact-relationship-${index}`}
                      placeholder="Relationship"
                      value={contact.relationship}
                      onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={addEmergencyContact}
              >
                Add Emergency Contact
              </Button>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="data-sharing" className="text-sm font-medium">
                  Data Sharing
                </Label>
                <Switch
                  id="data-sharing"
                  checked={settings.dataSharing}
                  onCheckedChange={(checked) => updateSetting('dataSharing', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics" className="text-sm font-medium">
                  Analytics
                </Label>
                <Switch
                  id="analytics"
                  checked={settings.analytics}
                  onCheckedChange={(checked) => updateSetting('analytics', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Accessibility */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-blue-600" />
                Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="text-sm font-medium">
                  High Contrast
                </Label>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="large-text" className="text-sm font-medium">
                  Large Text
                </Label>
                <Switch
                  id="large-text"
                  checked={settings.largeText}
                  onCheckedChange={(checked) => updateSetting('largeText', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion" className="text-sm font-medium">
                  Reduced Motion
                </Label>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Version</Label>
                <p className="text-sm text-gray-600 mt-1">1.0.0</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/about')}
              >
                About This App
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/help')}
              >
                Help & Support
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="sticky bottom-20 bg-white/95 backdrop-blur-sm rounded-lg p-4 border">
            <Button
              onClick={saveSettings}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;