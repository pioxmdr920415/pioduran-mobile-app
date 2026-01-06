import React, { useState, useEffect } from 'react';
import { Download, Trash2, MapPin, HardDrive, AlertCircle, CheckCircle, Info } from 'lucide-react';
import mapTileCache from '@/services/map/mapTileCache';

/**
 * Offline Map Settings Component
 * Displays map cache statistics and management options in Settings page
 */
const OfflineMapSettings = () => {
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    try {
      setLoading(true);
      const stats = await mapTileCache.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      setNotification({ type: 'error', message: 'Failed to load cache statistics' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached map tiles? This cannot be undone and you will need to download them again for offline use.')) {
      return;
    }

    try {
      setClearing(true);
      await mapTileCache.clearCache();
      await loadCacheStats();
      setNotification({ type: 'success', message: 'Map cache cleared successfully' });
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setNotification({ type: 'error', message: 'Failed to clear cache' });
    } finally {
      setClearing(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-blue-100 rounded-lg p-2">
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Offline Maps</h3>
          <p className="text-sm text-gray-600">Manage cached map tiles for offline use</p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-4 rounded-lg border-l-4 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <p className="text-sm text-gray-900">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading cache statistics...</p>
        </div>
      ) : (
        <>
          {/* Cache Statistics */}
          <div className="space-y-4 mb-6">
            {/* Storage Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <HardDrive className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Storage Used</p>
                    <p className="text-2xl font-bold text-gray-900">{cacheStats?.totalSizeMB || 0} MB</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Cached Tiles</p>
                  <p className="text-2xl font-bold text-gray-900">{cacheStats?.totalTiles?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Cached Areas</p>
                <p className="text-lg font-bold text-gray-900">{cacheStats?.areas || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Average Tile Size</p>
                <p className="text-lg font-bold text-gray-900">
                  {cacheStats?.totalTiles > 0 
                    ? formatBytes((cacheStats.totalSize || 0) / cacheStats.totalTiles)
                    : '0 KB'}
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 space-y-2">
                <p className="font-medium">How to download maps for offline use:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to the Map page</li>
                  <li>Click the download icon in the top-right corner</li>
                  <li>Select the area and zoom levels to cache</li>
                  <li>Click "Download for Offline Use"</li>
                </ol>
                <p className="text-xs text-blue-700 mt-2">
                  💡 Tip: Download maps while on WiFi to save mobile data
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {cacheStats && cacheStats.totalTiles > 0 ? (
              <>
                <button
                  onClick={handleClearCache}
                  disabled={clearing}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  {clearing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Clearing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      <span>Clear All Cached Maps</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  This will free up {cacheStats.totalSizeMB} MB of storage
                </p>
              </>
            ) : (
              <div className="text-center py-6">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">No cached maps</p>
                <p className="text-sm text-gray-500">
                  Visit the Map page to download maps for offline access
                </p>
              </div>
            )}
          </div>

          {/* Storage Recommendations */}
          {cacheStats && cacheStats.totalTiles > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Storage Recommendations</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <p>Keep essential areas cached (evacuation centers, hospitals)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <p>Cache zoom levels 12-15 for optimal balance</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-orange-600">!</span>
                  <p>Higher zoom levels use significantly more storage</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-orange-600">!</span>
                  <p>Clear old caches periodically to free up space</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OfflineMapSettings;
