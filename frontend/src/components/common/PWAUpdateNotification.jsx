import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const PWAUpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              setRegistration(reg);
              setShowUpdate(true);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Send message to service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page when the new service worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down"
      data-testid="pwa-update-notification"
    >
      <div className="bg-blue-600 text-white rounded-lg shadow-2xl p-4 flex items-center space-x-3 max-w-md">
        <RefreshCw className="w-6 h-6 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">New version available!</p>
          <p className="text-sm text-blue-100">Click update to get the latest features</p>
        </div>
        <button
          onClick={handleUpdate}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          data-testid="pwa-update-button"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;
