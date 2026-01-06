import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RotateCcw,
  RotateCw,
  FlashlightOff,
  Flashlight,
  ZoomIn,
  ZoomOut,
  Sun,
  Download,
  MapPin,
  Clock,
  Image,
  Settings,
  X,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Resolution presets (moved outside component as it's a constant)
const resolutionPresets = {
  hd: { width: 1280, height: 720, label: 'HD (720p)' },
  fullhd: { width: 1920, height: 1080, label: 'Full HD (1080p)' },
  '2k': { width: 2560, height: 1440, label: '2K (1440p)' },
  '4k': { width: 3840, height: 2160, label: '4K (2160p)' }
};

const GeoTagCamera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const { toast } = useToast();

  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [flash, setFlash] = useState('off');
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [processing, setProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [customLogo, setCustomLogo] = useState(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resolution, setResolution] = useState('fullhd');
  const [autoSave, setAutoSave] = useState(() => {
    const saved = localStorage.getItem('geotagAutoSave');
    return saved ? JSON.parse(saved) : false;
  });

  // Get current timestamp
  const updateTimestamp = useCallback(() => {
    const now = new Date();
    setTimestamp(now.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }));
  }, []);

  // Get current location
  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setAddress('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setAddress(data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } catch (err) {
          setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
      },
      (error) => {
        console.error('Location error:', error);
        setAddress('Location unavailable');
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const selectedResolution = resolutionPresets[resolution];
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: selectedResolution.width },
          height: { ideal: selectedResolution.height }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      getLocation();
      updateTimestamp();

      // Update timestamp every second
      const interval = setInterval(updateTimestamp, 1000);
      return () => clearInterval(interval);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please grant camera permissions.');
    }
  }, [facingMode, getLocation, updateTimestamp, resolution]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Switch camera
  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Toggle flash (if supported)
  const toggleFlash = async () => {
    const newFlash = flash === 'off' ? 'on' : 'off';
    setFlash(newFlash);

    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.();

      if (capabilities?.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: newFlash === 'on' }]
          });
        } catch (err) {
          console.error('Flash toggle failed:', err);
        }
      }
    }
  };

  // Capture photo
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setProcessing(true);
    updateTimestamp();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply brightness filter
    ctx.filter = `brightness(${brightness}%)`;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Reset filter for text
    ctx.filter = 'none';

    // Add metadata overlay at bottom left
    const padding = 20;
    const lineHeight = 24;
    let yPos = canvas.height - padding - (4 * lineHeight);

    // Semi-transparent background for text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, yPos - 10, canvas.width * 0.6, (5 * lineHeight) + 20);

    // Draw logo if exists
    if (customLogo) {
      const logoImg = new window.Image();
      logoImg.src = customLogo;
      await new Promise((resolve) => {
        logoImg.onload = () => {
          const logoSize = 60;
          ctx.drawImage(logoImg, padding, yPos, logoSize, logoSize);
          resolve();
        };
        logoImg.onerror = resolve;
      });
    } else {
      // Draw default logo
      const defaultLogo = new window.Image();
      defaultLogo.src = '/images/logo.webp';
      await new Promise((resolve) => {
        defaultLogo.onload = () => {
          const logoSize = 60;
          ctx.drawImage(defaultLogo, padding, yPos, logoSize, logoSize);
          resolve();
        };
        defaultLogo.onerror = resolve;
      });
    }

    // Text styling
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textBaseline = 'top';

    const textX = padding + 70;

    // Draw event title
    if (eventTitle) {
      ctx.fillText(eventTitle, textX, yPos);
      yPos += lineHeight;
    }

    // Draw MDRRMO title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('MDRRMO PIO DURAN', textX, yPos);
    yPos += lineHeight;

    // Draw timestamp
    ctx.font = '14px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`${timestamp}`, textX, yPos);
    yPos += lineHeight;

    // Draw location
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    const maxAddressLength = 60;
    const truncatedAddress = address.length > maxAddressLength
      ? address.substring(0, maxAddressLength) + '...'
      : address;
    ctx.fillText(`${truncatedAddress}`, textX, yPos);
    yPos += lineHeight;

    // Draw coordinates if available
    if (location) {
      ctx.fillText(`Lat: ${location.lat.toFixed(6)}, Lon: ${location.lon.toFixed(6)}`, textX, yPos);
    }

    // Convert to image
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageData);
    setProcessing(false);

    // Auto-save if enabled
    if (autoSave) {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = imageData;
        const fileName = `MDRRMO_${eventTitle || 'capture'}_${new Date().toISOString().slice(0, 10)}_${Date.now()}.jpg`;
        link.download = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
        link.click();
        
        // Show toast notification
        toast({
          title: "Photo Auto-Saved! 📸",
          description: `Saved as ${fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')}`,
          duration: 3000,
        });
      }, 100);
    }
  };

  // Download captured image
  const downloadImage = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.href = capturedImage;
    const fileName = `MDRRMO_${eventTitle || 'capture'}_${new Date().toISOString().slice(0, 10)}.jpg`;
    link.download = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    link.click();
  };

  // Handle custom logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle auto-save and save preference
  const toggleAutoSave = () => {
    const newValue = !autoSave;
    setAutoSave(newValue);
    localStorage.setItem('geotagAutoSave', JSON.stringify(newValue));
  };

  // Reset and retake
  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Start camera on mount, restart on facingMode change
  useEffect(() => {
    if (cameraActive || !capturedImage) {
      startCamera();
    }

    return () => stopCamera();
  }, [facingMode, resolution]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto rotate effect
  useEffect(() => {
    if (autoRotate) {
      const interval = setInterval(() => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRotate]);

  // Captured image preview
  if (capturedImage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 mt-2">
        <main className="px-4 pt-4 pb-24">
          <div className="relative rounded-2xl overflow-hidden mb-4">
            <img src={capturedImage} alt="Captured" className="w-full" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={retake}
              className="flex-1 p-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Retake
            </button>
            <button
              onClick={downloadImage}
              className="flex-1 p-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              Save Photo
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Header */}
      <div className="bg-black/80 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <img src="/images/logo.webp" alt="Logo" className="w-8 h-8" />
          <div>
            <h1 className="text-sm font-bold text-white">GeoTag Camera</h1>
            <p className="text-xs text-yellow-500">MDRRMO Pio Duran</p>
          </div>
          
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative mt-16">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 px-6">
            <Camera className="w-16 h-16 text-white/30 mb-4" />
            <p className="text-white text-center mb-4">{cameraError}</p>
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-yellow-500 rounded-xl text-black font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              transform: `scale(${zoom})`,
              filter: `brightness(${brightness}%)`,
              aspectRatio: '4 / 3'
            }}
          />
        )}

        {/* Live Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/60 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-white">{timestamp}</span>
          </div>
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-white/80 line-clamp-2">{address || 'Fetching location...'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-yellow-500 font-medium">
              {resolutionPresets[resolution].label}
            </span>
            {autoSave && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <Download className="w-3 h-3" />
                Auto-Save ON
              </span>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute inset-x-4 top-4 bg-black/90 rounded-xl p-4 z-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Camera Settings</h3>
              <button onClick={() => setShowSettings(false)}>
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Event Title */}
            <div className="mb-4">
              <label className="text-sm text-white/70 mb-1 block">Event Title</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Enter event/title name"
                className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm"
              />
            </div>

            {/* Resolution Settings */}
            <div className="mb-4">
              <label className="text-sm text-white/70 mb-2 block">Resolution</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(resolutionPresets).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setResolution(key)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      resolution === key
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {value.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Save Toggle */}
            <div className="mb-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 border border-white/20">
                <div>
                  <label className="text-sm text-white font-medium block">Auto-Save Photos</label>
                  <p className="text-xs text-white/60 mt-0.5">Automatically download after capture</p>
                </div>
                <button
                  onClick={toggleAutoSave}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSave ? 'bg-yellow-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      autoSave ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Zoom */}
            <div className="mb-4">
              <label className="text-sm text-white/70 mb-1 flex items-center gap-2">
                <ZoomIn className="w-4 h-4" /> Zoom: {zoom.toFixed(1)}x
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-yellow-500"
              />
            </div>

            {/* Brightness */}
            <div className="mb-4">
              <label className="text-sm text-white/70 mb-1 flex items-center gap-2">
                <Sun className="w-4 h-4" /> Brightness: {brightness}%
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full accent-yellow-500"
              />
            </div>

            {/* Custom Logo */}
            <div>
              <label className="text-sm text-white/70 mb-1 block">Custom Logo</label>
              <div className="flex items-center gap-2">
                {customLogo ? (
                  <div className="relative">
                    <img src={customLogo} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
                    <button
                      onClick={() => setCustomLogo(null)}
                      className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                    <Image className="w-6 h-6 text-white/50" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
                <span className="text-xs text-white/50">Upload custom logo</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="bg-black px-6 py-6 pb-24">
        <div className="flex items-center justify-around">
          {/* Flash Toggle */}
          <button
            onClick={toggleFlash}
            className="p-3 bg-white/10 rounded-full"
          >
            {flash === 'on' ? (
              <Flashlight className="w-6 h-6 text-yellow-500" />
            ) : (
              <FlashlightOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Auto Rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-3 rounded-full ${autoRotate ? 'bg-yellow-500' : 'bg-white/10'}`}
          >
            <RotateCw className="w-6 h-6 text-white" />
          </button>

          {/* Capture Button */}
          <button
            onClick={capturePhoto}
            disabled={processing || !cameraActive}
            className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center disabled:opacity-50"
          >
            <div className="absolute inset-2 rounded-full border-4 border-black" />
            {processing && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>

          {/* Switch Camera */}
          <button
            onClick={switchCamera}
            className="p-3 bg-white/10 rounded-full"
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default GeoTagCamera;
