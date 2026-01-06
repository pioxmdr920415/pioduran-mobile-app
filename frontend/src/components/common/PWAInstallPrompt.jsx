import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone ||
                       document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt after a delay
      setTimeout(() => {
        const hasShownPrompt = localStorage.getItem('pwa-install-prompt-shown');
        if (!hasShownPrompt) {
          setShowPrompt(true);
        }
      }, 5000); // Show after 5 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS install prompt if applicable
    if (iOS && !standalone) {
      setTimeout(() => {
        const hasShownPrompt = localStorage.getItem('pwa-install-prompt-shown');
        if (!hasShownPrompt) {
          setShowPrompt(true);
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) {
      return;
    }

    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      // Clear the deferredPrompt for reuse
      setDeferredPrompt(null);
    }

    // Hide the prompt
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-shown', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-shown', 'true');
  };

  // Don't show if already installed or if dismissed
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up"
      data-testid="pwa-install-prompt"
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
              <Smartphone className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Install Emergency Response</h3>
              <p className="text-sm text-gray-600">Get quick access and offline support</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="pwa-dismiss-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isIOS ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-blue-900 mb-2 font-medium">To install on iOS:</p>
            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>Tap the Share button <span className="inline-block">📤</span></li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right corner</li>
            </ol>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            data-testid="pwa-install-button"
          >
            <Download className="w-5 h-5" />
            <span>Install App</span>
          </button>
        )}

        <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
            Works Offline
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
            Fast Access
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-1.5"></span>
            Notifications
          </span>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
