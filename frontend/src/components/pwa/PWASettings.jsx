import React, { useState, useEffect } from 'react';
import { Trash2, Database, HardDrive, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import cacheManager from '@/utils/cacheManager';
import offlineStorage from '@/utils/offlineStorage';
import offlineSync from '@/services/offlineSync';
import { useOnlineStatus } from '@/hooks/usePWA';

const PWASettings = () => {
  const isOnline = useOnlineStatus();
  const [cacheSize, setCacheSize] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const size = await cacheManager.getCacheSize();
      setCacheSize(size);

      const pending = await offlineSync.getPendingCount();
      setPendingCount(pending);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached data? This will require re-downloading resources on next visit.')) {
      return;
    }

    setLoading(true);
    try {
      await cacheManager.clearAllCaches();
      setMessage({ type: 'success', text: 'Cache cleared successfully' });
      await loadStats();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear cache' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSyncNow = async () => {
    if (!isOnline) {
      setMessage({ type: 'error', text: 'Cannot sync while offline' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);
    try {
      await offlineSync.forceSyncNow();
      setMessage({ type: 'success', text: 'Sync completed successfully' });
      await loadStats();
    } catch (error) {
      setMessage({ type: 'error', text: 'Sync failed' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PWA Settings</h2>
        <p className="text-gray-600 text-sm">
          Manage offline data, cache, and sync settings
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Storage Stats */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <HardDrive className="w-5 h-5" />
          <span>Storage Usage</span>
        </h3>
        
        {cacheSize ? (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Used:</span>
              <span className="font-semibold text-gray-900">
                {formatBytes(cacheSize.usage)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Available:</span>
              <span className="font-semibold text-gray-900">
                {formatBytes(cacheSize.quota)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Percentage:</span>
              <span className="font-semibold text-gray-900">
                {cacheSize.percentage}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${
                  cacheSize.percentage > 80
                    ? 'bg-red-600'
                    : cacheSize.percentage > 50
                    ? 'bg-orange-500'
                    : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(cacheSize.percentage, 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
            Storage info not available
          </div>
        )}
      </div>

      {/* Offline Data */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Offline Data</span>
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Pending sync items:</span>
            <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
              pendingCount > 0
                ? 'bg-orange-100 text-orange-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {pendingCount}
            </span>
          </div>
          
          {pendingCount > 0 && (
            <p className="text-xs text-gray-500">
              {isOnline 
                ? 'Click "Sync Now" to upload pending data'
                : 'Data will sync automatically when back online'
              }
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
        
        <div className="space-y-2">
          {/* Sync Now Button */}
          <button
            onClick={handleSyncNow}
            disabled={loading || !isOnline || pendingCount === 0}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              loading || !isOnline || pendingCount === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            data-testid="sync-now-button"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>
              {loading ? 'Syncing...' : `Sync Now ${pendingCount > 0 ? `(${pendingCount})` : ''}`}
            </span>
          </button>

          {/* Clear Cache Button */}
          <button
            onClick={handleClearCache}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="clear-cache-button"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear Cache</span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">About Offline Mode</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Reports submitted offline will sync automatically when back online</li>
          <li>Cached data allows the app to work without internet</li>
          <li>Clearing cache will require re-downloading on next visit</li>
          <li>Location services work offline for coordinates</li>
        </ul>
      </div>
    </div>
  );
};

export default PWASettings;
