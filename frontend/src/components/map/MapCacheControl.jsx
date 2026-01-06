import React, { useState, useEffect } from 'react';
import { Download, Trash2, MapPin, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import mapTileCache from '@/services/map/mapTileCache';
import { useMap } from 'react-leaflet';

/**
 * Map Cache Control Component
 * Provides UI for downloading and managing offline map tiles
 */
const MapCacheControl = () => {
  const map = useMap();
  const [isOpen, setIsOpen] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [downloadArea, setDownloadArea] = useState('current');
  const [zoomLevels, setZoomLevels] = useState({ min: 12, max: 15 });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadCacheStats();

    // Listen to cache events
    const unsubscribe = mapTileCache.addListener(handleCacheEvent);

    return unsubscribe;
  }, []);

  const loadCacheStats = async () => {
    try {
      const stats = await mapTileCache.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  const handleCacheEvent = ({ event, data }) => {
    switch (event) {
      case 'download-start':
        setDownloading(true);
        setDownloadProgress({ progress: 0, ...data });
        break;

      case 'download-progress':
        setDownloadProgress(prev => ({ ...prev, ...data }));
        break;

      case 'download-complete':
        setDownloading(false);
        setDownloadProgress(null);
        showNotification('success', `Successfully cached ${data.downloadedTiles} tiles!`);
        loadCacheStats();
        break;

      case 'download-error':
        setDownloading(false);
        setDownloadProgress(null);
        showNotification('error', `Download failed: ${data.error}`);
        break;

      default:
        break;
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDownload = async () => {
    try {
      const bounds = map.getBounds();
      const mapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      };

      // Expand bounds based on download area selection
      let downloadBounds = mapBounds;
      if (downloadArea === 'expanded') {
        const latDiff = mapBounds.north - mapBounds.south;
        const lngDiff = mapBounds.east - mapBounds.west;
        downloadBounds = {
          north: mapBounds.north + latDiff,
          south: mapBounds.south - latDiff,
          east: mapBounds.east + lngDiff,
          west: mapBounds.west - lngDiff,
        };
      }

      await mapTileCache.downloadArea(
        downloadBounds,
        zoomLevels.min,
        zoomLevels.max,
        'pioduran'
      );
    } catch (error) {
      console.error('Download failed:', error);
      showNotification('error', error.message);
    }
  };

  const handleCancelDownload = () => {
    mapTileCache.cancelDownload();
    setDownloading(false);
    setDownloadProgress(null);
    showNotification('info', 'Download cancelled');
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached map tiles? This cannot be undone.')) {
      return;
    }

    try {
      await mapTileCache.clearCache();
      loadCacheStats();
      showNotification('success', 'Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      showNotification('error', 'Failed to clear cache');
    }
  };

  const estimateTileCount = () => {
    const bounds = map.getBounds();
    const mapBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };

    let downloadBounds = mapBounds;
    if (downloadArea === 'expanded') {
      const latDiff = mapBounds.north - mapBounds.south;
      const lngDiff = mapBounds.east - mapBounds.west;
      downloadBounds = {
        north: mapBounds.north + latDiff,
        south: mapBounds.south - latDiff,
        east: mapBounds.east + lngDiff,
        west: mapBounds.west - lngDiff,
      };
    }

    const tiles = mapTileCache.getTilesInBounds(
      downloadBounds,
      zoomLevels.min,
      zoomLevels.max
    );

    return tiles.length;
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="leaflet-top leaflet-right" style={{ marginTop: '80px' }}>
        <div className="leaflet-control leaflet-bar">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-white hover:bg-gray-50 p-2 rounded shadow-md border border-gray-300"
            title="Offline Map Cache"
            style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Download className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="leaflet-top leaflet-center" style={{ marginTop: '120px', zIndex: 1000 }}>
          <div className={`bg-white rounded-lg shadow-lg p-4 border-l-4 ${
            notification.type === 'success' ? 'border-green-500' :
            notification.type === 'error' ? 'border-red-500' : 'border-blue-500'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {notification.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-500" />}
              <p className="text-sm text-gray-900">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      {isOpen && (
        <div className="leaflet-top leaflet-right" style={{ marginTop: '120px', maxWidth: '320px' }}>
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Offline Maps</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cache Stats */}
            {cacheStats && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cached Tiles:</span>
                    <span className="font-semibold text-gray-900">{cacheStats.totalTiles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Storage Used:</span>
                    <span className="font-semibold text-gray-900">{cacheStats.totalSizeMB} MB</span>
                  </div>
                </div>
              </div>
            )}

            {/* Download Progress */}
            {downloading && downloadProgress && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Downloading...</span>
                  <span className="text-sm text-gray-600">{downloadProgress.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress.progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Downloaded: {downloadProgress.downloadedTiles} / {downloadProgress.totalTiles} tiles</div>
                  <div>Already Cached: {downloadProgress.cachedTiles}</div>
                  {downloadProgress.failedTiles > 0 && (
                    <div className="text-red-600">Failed: {downloadProgress.failedTiles}</div>
                  )}
                </div>
                <button
                  onClick={handleCancelDownload}
                  className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Cancel Download
                </button>
              </div>
            )}

            {/* Download Controls */}
            {!downloading && (
              <>
                <div className="space-y-3 mb-4">
                  {/* Area Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Download Area
                    </label>
                    <select
                      value={downloadArea}
                      onChange={(e) => setDownloadArea(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="current">Current View</option>
                      <option value="expanded">Expanded Area (3x)</option>
                    </select>
                  </div>

                  {/* Zoom Levels */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Zoom Levels ({zoomLevels.min} - {zoomLevels.max})
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="18"
                        value={zoomLevels.min}
                        onChange={(e) => setZoomLevels(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                        className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        min="1"
                        max="18"
                        value={zoomLevels.max}
                        onChange={(e) => setZoomLevels(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                        className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  {/* Estimate */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-xs text-yellow-800">
                        <p className="font-medium mb-1">Estimated: ~{estimateTileCount().toLocaleString()} tiles</p>
                        <p>Size: ~{((estimateTileCount() * 20) / 1024).toFixed(1)} MB</p>
                        <p className="mt-1">Higher zoom levels = more tiles. Use WiFi for large downloads.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleDownload}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download for Offline Use</span>
                  </button>

                  {cacheStats && cacheStats.totalTiles > 0 && (
                    <button
                      onClick={handleClearCache}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear Cache</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Info */}
            <div className="mt-4 text-xs text-gray-500 border-t border-gray-200 pt-3">
              <p>💡 Tip: Download maps while connected to WiFi for offline access during emergencies.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapCacheControl;
