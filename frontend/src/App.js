import "@/App.css";
import "@/styles/emergency.css";
import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import PWAInstallPrompt from "./components/common/PWAInstallPrompt";
import PWAUpdateNotification from "./components/common/PWAUpdateNotification";
import NetworkStatusIndicator from "./components/common/NetworkStatusIndicator";
import OfflineSyncStatus from "./components/offline/OfflineSyncStatus";
import analyticsService from "./services/analyticsService";

// Pages
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const EmergencyHotline = lazy(() => import("./pages/EmergencyHotline"));
const ReportIncident = lazy(() => import("./pages/ReportIncident"));
const GeoTagCamera = lazy(() => import("./pages/GeoTagCamera"));
const TyphoonDashboard = lazy(() => import("./pages/TyphoonDashboard"));
const PioDuranMap = lazy(() => import("./pages/PioDuranMap"));
const DisasterGuidelines = lazy(() => import("./pages/DisasterGuidelines"));
const SupportResources = lazy(() => import("./pages/SupportResources"));
const EmergencyPlan = lazy(() => import("./pages/EmergencyPlan"));
const AIEmergencyAssistant = lazy(() => import("./pages/AIEmergencyAssistant"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Settings = lazy(() => import("./pages/Settings"));
const Help = lazy(() => import("./pages/Help"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));

// Analytics tracking component
function AnalyticsTracker() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const pageName = location.pathname.replace('/', '') || 'home';
    analyticsService.trackPageView(pageName, user?.id);
  }, [location, user]);

  return null;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AnalyticsTracker />
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/emergency-hotline" element={<EmergencyHotline />} />
              <Route path="/report-incident" element={<ReportIncident />} />
              <Route path="/geotag-camera" element={<GeoTagCamera />} />
              <Route path="/typhoon-dashboard" element={<TyphoonDashboard />} />
              <Route path="/map" element={<PioDuranMap />} />
              <Route path="/disaster-guidelines" element={<DisasterGuidelines />} />
              <Route path="/support-resources" element={<SupportResources />} />
              <Route path="/emergency-plan" element={<EmergencyPlan />} />
              <Route path="/ai-emergency-assistant" element={<AIEmergencyAssistant />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </Suspense>
          <Toaster />
          <NetworkStatusIndicator />
          <OfflineSyncStatus />
          <PWAInstallPrompt />
          <PWAUpdateNotification />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
