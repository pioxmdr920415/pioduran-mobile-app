import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import pushNotificationService from '../../services/pushNotificationService';

const NotificationSettings = ({ userId }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState({
    incidents: true,
    typhoons: true,
    emergency_broadcasts: true,
    system_updates: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkSubscriptionStatus();
    if (userId) {
      loadPreferences();
    }
  }, [userId]);

  const checkSubscriptionStatus = async () => {
    const status = await pushNotificationService.getSubscriptionStatus();
    setIsSubscribed(status);
  };

  const loadPreferences = async () => {
    try {
      const prefs = await pushNotificationService.getPreferences(userId);
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setMessage('');
    try {
      await pushNotificationService.subscribe(userId);
      setIsSubscribed(true);
      setMessage('Successfully subscribed to push notifications!');
    } catch (error) {
      setMessage(`Failed to subscribe: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setMessage('');
    try {
      await pushNotificationService.unsubscribe();
      setIsSubscribed(false);
      setMessage('Successfully unsubscribed from push notifications');
    } catch (error) {
      setMessage(`Failed to unsubscribe: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handlePreferenceChange = async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    setPreferences(newPreferences);

    try {
      await pushNotificationService.updatePreferences(userId, newPreferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      // Revert on error
      setPreferences(preferences);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6" data-testid="notification-settings">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Push Notifications
          </h2>
          <p className="text-gray-600 mt-1">Manage your notification preferences</p>
        </div>
        {isSubscribed ? (
          <button
            onClick={handleUnsubscribe}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            data-testid="unsubscribe-button"
          >
            <BellOff className="w-4 h-4" />
            Unsubscribe
          </button>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            data-testid="subscribe-button"
          >
            <Bell className="w-4 h-4" />
            Enable Notifications
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {isSubscribed && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notification Types</h3>
          
          <NotificationToggle
            label="Incident Reports"
            description="Get notified about new incident reports"
            enabled={preferences.incidents}
            onChange={() => handlePreferenceChange('incidents')}
          />
          
          <NotificationToggle
            label="Typhoon Alerts"
            description="Receive updates about typhoon movements and warnings"
            enabled={preferences.typhoons}
            onChange={() => handlePreferenceChange('typhoons')}
          />
          
          <NotificationToggle
            label="Emergency Broadcasts"
            description="Critical emergency announcements and alerts"
            enabled={preferences.emergency_broadcasts}
            onChange={() => handlePreferenceChange('emergency_broadcasts')}
          />
          
          <NotificationToggle
            label="System Updates"
            description="App updates and maintenance notifications"
            enabled={preferences.system_updates}
            onChange={() => handlePreferenceChange('system_updates')}
          />
        </div>
      )}

      {!isSubscribed && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            Enable push notifications to receive real-time emergency alerts and important updates.
          </p>
        </div>
      )}
    </div>
  );
};

const NotificationToggle = ({ label, description, enabled, onChange }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        } relative`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
          enabled ? 'transform translate-x-6' : ''
        }`} />
      </button>
    </div>
  );
};

export default NotificationSettings;
