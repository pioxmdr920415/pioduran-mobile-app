import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, CloudOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/usePWA';

const NetworkStatusIndicator = () => {
  const isOnline = useOnlineStatus();
  const [showIndicator, setShowIndicator] = useState(false);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      // Show immediately when offline
      setShowIndicator(true);
      setJustCameOnline(false);
    } else {
      // When coming back online, show for 3 seconds then hide
      if (showIndicator) {
        setJustCameOnline(true);
        const timer = setTimeout(() => {
          setShowIndicator(false);
          setJustCameOnline(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, showIndicator]);

  if (!showIndicator) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        isOnline
          ? 'bg-green-600'
          : 'bg-red-600'
      } text-white text-center py-2 px-4 transition-all duration-300`}
      data-testid="network-status-indicator"
    >
      <div className="flex items-center justify-center space-x-2 text-sm font-medium">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Back Online - Syncing data...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You're Offline - Some features may be limited</span>
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkStatusIndicator;
