#!/bin/bash

echo "=================================================="
echo "   PWA Implementation Verification"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (Missing: $1)"
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (Missing: $1)"
        return 1
    fi
}

echo "📱 Checking PWA Core Files..."
echo "-----------------------------------"
check_file "/app/frontend/public/manifest.json" "Web App Manifest"
check_file "/app/frontend/public/service-worker.js" "Service Worker"
check_file "/app/frontend/public/offline.html" "Offline Page"
check_file "/app/frontend/public/browserconfig.xml" "Browser Config"
check_file "/app/frontend/public/robots.txt" "Robots.txt"
check_file "/app/frontend/public/favicon.ico" "Favicon"

echo ""
echo "🎨 Checking PWA Icons..."
echo "-----------------------------------"
check_dir "/app/frontend/public/pwa-icons" "PWA Icons Directory"

ICON_SIZES=("72x72" "96x96" "128x128" "144x144" "152x152" "192x192" "384x384" "512x512")
for size in "${ICON_SIZES[@]}"; do
    check_file "/app/frontend/public/pwa-icons/icon-${size}.png" "Icon ${size}"
done

echo ""
echo "⚛️  Checking React Components..."
echo "-----------------------------------"
check_file "/app/frontend/src/serviceWorkerRegistration.js" "Service Worker Registration"
check_file "/app/frontend/src/components/common/PWAInstallPrompt.jsx" "Install Prompt Component"
check_file "/app/frontend/src/components/common/PWAUpdateNotification.jsx" "Update Notification Component"
check_file "/app/frontend/src/components/common/NetworkStatusIndicator.jsx" "Network Status Component"

echo ""
echo "🛠️  Checking Utilities..."
echo "-----------------------------------"
check_file "/app/frontend/src/utils/offlineStorage.js" "Offline Storage Utility"
check_file "/app/frontend/src/hooks/usePWA.js" "PWA Custom Hooks"

echo ""
echo "🌐 Testing Endpoints..."
echo "-----------------------------------"

# Test manifest accessibility
if curl -s -f http://localhost:3000/manifest.json > /dev/null; then
    echo -e "${GREEN}✓${NC} Manifest accessible at /manifest.json"
else
    echo -e "${RED}✗${NC} Manifest not accessible"
fi

# Test service worker accessibility
if curl -s -f http://localhost:3000/service-worker.js > /dev/null; then
    echo -e "${GREEN}✓${NC} Service Worker accessible at /service-worker.js"
else
    echo -e "${RED}✗${NC} Service Worker not accessible"
fi

# Test offline page
if curl -s -f http://localhost:3000/offline.html > /dev/null; then
    echo -e "${GREEN}✓${NC} Offline page accessible at /offline.html"
else
    echo -e "${RED}✗${NC} Offline page not accessible"
fi

# Test icon accessibility
if curl -s -f http://localhost:3000/pwa-icons/icon-192x192.png > /dev/null; then
    echo -e "${GREEN}✓${NC} PWA icons accessible"
else
    echo -e "${RED}✗${NC} PWA icons not accessible"
fi

echo ""
echo "📊 Service Status..."
echo "-----------------------------------"
supervisorctl status | grep -E "frontend|backend"

echo ""
echo "=================================================="
echo "   PWA Verification Complete!"
echo "=================================================="
echo ""
echo "📱 To test PWA features:"
echo "   1. Open app in Chrome/Edge"
echo "   2. Check for install prompt"
echo "   3. Open DevTools → Lighthouse → PWA audit"
echo "   4. Test offline mode in DevTools"
echo ""
echo "🎯 Access the app at:"
echo "   https://8211e6fc-9c0a-4e15-ba62-6a8e16e94bc4.preview.emergentagent.com"
echo ""
