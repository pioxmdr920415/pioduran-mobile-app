import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Cloud, CloudOff } from 'lucide-react';
import offlineSync from '@/services/offlineSync';
import { useOnlineStatus } from '@/hooks/usePWA';

const OfflineSyncStatus = () => {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Get initial pending count
    updatePendingCount();

    // Listen to sync events
    const unsubscribe = offlineSync.addListener(handleSyncEvent);

    // Update count every 30 seconds
    const interval = setInterval(updatePendingCount, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const updatePendingCount = async () => {
    try {
      const count = await offlineSync.getPendingCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  };

  const handleSyncEvent = ({ event, data }) => {
    switch (event) {
      case 'sync-start':
        setSyncing(true);
        setLastSyncStatus(null);
        break;
      
      case 'sync-complete':
        setSyncing(false);
        setLastSyncStatus({ success: true, ...data });
        updatePendingCount();
        break;
      
      case 'sync-error':
        setSyncing(false);
        setLastSyncStatus({ success: false, ...data });
        break;
      
      case 'incident-saved-offline':
        updatePendingCount();
        break;
      
      default:
        break;
    }
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      alert('Cannot sync while offline. Please check your internet connection.');
      return;
    }

    try {
      setSyncing(true);
      await offlineSync.forceSyncNow();
    } catch (error) {
      console.error('Manual sync failed:', error);
      alert('Sync failed: ' + error.message);
    }
  };

  if (pendingCount === 0 && !syncing && !lastSyncStatus) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Cloud className="w-5 h-5 text-green-600" />
            ) : (
              <CloudOff className="w-5 h-5 text-red-600" />
            )}
            <h3 className="font-semibold text-gray-900">
              {isOnline ? 'Online' : 'Offline'}
            </h3>
          </div>
          
          {showDetails && (
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Pending Count */}
        {pendingCount > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span>
              {pendingCount} {pendingCount === 1 ? 'item' : 'items'} pending sync
            </span>
          </div>
        )}

        {/* Syncing Status */}
        {syncing && (
          <div className="flex items-center space-x-2 text-sm text-blue-600 mb-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Syncing data...</span>
          </div>
        )}

        {/* Last Sync Status */}
        {lastSyncStatus && (
          <div className="text-sm mb-2">
            {lastSyncStatus.success ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Sync completed successfully</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Sync failed</span>
              </div>
            )}
          </div>
        )}

        {/* Manual Sync Button */}
        {isOnline && pendingCount > 0 && !syncing && (
          <button
            onClick={handleManualSync}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            data-testid="manual-sync-button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Now</span>
          </button>
        )}

        {/* Offline Message */}
        {!isOnline && pendingCount > 0 && (
          <div className="text-xs text-gray-500 text-center">
            Data will sync automatically when back online
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineSyncStatus;
