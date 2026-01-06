import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bot,
    MessageSquare,
    Wifi,
    WifiOff,
    AlertTriangle,
    Phone,
    MapPin,
    Shield,
    Heart,
    Clock,
    Search,
    Send,
    Mic,
    Square,
    X,
    Volume2,
    VolumeX,
    Eye,
    EyeOff,
    CheckSquare,
    Accessibility
} from 'lucide-react';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import EmergencyFAQ from '../components/emergency/EmergencyFAQ';
import EmergencyContacts from '../components/emergency/EmergencyContacts';
import EmergencyChat from '../components/emergency/EmergencyChat';
import EmergencyAccessibility from '../components/emergency/EmergencyAccessibility';

const AIEmergencyAssistant = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [currentView, setCurrentView] = useState('chat'); // 'chat', 'faq', 'contacts'
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [emergencyMode, setEmergencyMode] = useState(false);

    const chatContainerRef = useRef(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (emergencyMode) {
            document.body.style.overflow = 'hidden';
            document.body.style.backgroundColor = '#1f2937';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.backgroundColor = '';
        }
    }, [emergencyMode]);

    const emergencyHotline = {
        police: '117',
        fire: '118',
        ambulance: '118',
        disaster: '117',
        general: '117'
    };

    const emergencyActions = [
        {
            title: 'Call Emergency Services',
            description: 'Connect to police, fire, or medical services',
            icon: Phone,
            action: () => window.open(`tel:${emergencyHotline.general}`),
            color: 'bg-red-600'
        },
        {
            title: 'Find Nearest Hospital',
            description: 'Get directions to the closest medical facility',
            icon: MapPin,
            action: () => {
                const location = 'hospital near me';
                window.open(`https://maps.google.com/?q=${encodeURIComponent(location)}`);
            },
            color: 'bg-blue-600'
        },
        {
            title: 'Emergency Checklist',
            description: 'Quick reference for emergency procedures',
            icon: CheckSquare,
            action: () => setCurrentView('faq'),
            color: 'bg-green-600'
        }
    ];

    const EmergencyIcon = () => (
        <div className="animate-pulse">
            <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
    );

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 ${emergencyMode ? 'emergency-active' : ''}`}>
            {/* Emergency Mode Overlay */}
            {emergencyMode && (
                <div className="fixed inset-0 bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-md z-50 pointer-events-none">
                    <div className="absolute top-6 left-6 right-6 text-center">
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-2xl font-bold text-lg animate-pulse shadow-2xl shadow-red-500/50 border border-red-400/50">
                            🚨 EMERGENCY MODE ACTIVE
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <Header
                title="AI Emergency Assistant"
                subtitle={isOnline ? "Online - AI Ready" : "Offline - FAQ Available"}
                showBack={true}
                icon={Bot}
            />

            {/* Main Content */}
            <main className="pt-24 pb-28 px-5 max-w-md mx-auto space-y-6">
                {/* Connection Status */}
                <div className="flex items-center justify-between bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl shadow-black/20">
                    <div className="flex items-center gap-3">
                        {isOnline ? (
                            <div className="relative">
                                <Wifi className="w-6 h-6 text-emerald-400" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                            </div>
                        ) : (
                            <WifiOff className="w-6 h-6 text-red-400" />
                        )}
                        <div>
                            <span className="text-white font-semibold text-base block">
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                            <span className="text-white/60 text-xs">
                                {isOnline ? 'All systems operational' : 'Limited functionality'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-3 rounded-xl transition-all duration-300 ${isMuted ? 'bg-gray-700 text-gray-300' : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'}`}
                        >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-3 bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg"
                        >
                            {isFullscreen ? <X className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Emergency Actions */}
                <div>
                    <h2 className="text-white font-display font-bold text-lg mb-4 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg shadow-yellow-500/30">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {emergencyActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                className={`${action.color} text-white p-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-4 group`}
                            >
                                <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-300">
                                    <action.icon className="w-7 h-7" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-bold text-lg font-display">{action.title}</div>
                                    <div className="text-sm opacity-90 mt-1">{action.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Emergency Mode Toggle */}
                <div>
                    <button
                        onClick={() => setEmergencyMode(!emergencyMode)}
                        className={`w-full py-4 px-6 rounded-2xl font-bold font-display text-lg transition-all duration-300 ${emergencyMode
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-2xl shadow-red-500/50 border-2 border-red-400'
                            : 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-xl shadow-red-500/40'
                            }`}
                    >
                        {emergencyMode ? (
                            <div className="flex items-center justify-center gap-3">
                                <Square className="w-6 h-6" />
                                Exit Emergency Mode
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-3">
                                <AlertTriangle className="w-6 h-6" />
                                Activate Emergency Mode
                            </div>
                        )}
                    </button>
                </div>

                {/* View Toggle */}
                <div className="flex bg-gradient-to-br from-white/15 to-white/5 rounded-2xl p-1.5 border border-white/20 backdrop-blur-lg shadow-xl">
                    {[
                        { key: 'chat', label: 'AI Chat', icon: MessageSquare },
                        { key: 'faq', label: 'FAQ', icon: Search },
                        { key: 'contacts', label: 'Contacts', icon: Phone },
                        { key: 'accessibility', label: 'Access', icon: Accessibility }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setCurrentView(tab.key)}
                                className={`flex-1 py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-300 ${currentView === tab.key
                                    ? 'bg-gradient-to-br from-white to-gray-100 text-slate-900 shadow-lg'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Icon className="w-5 h-5 mx-auto mb-1" />
                                <div className="text-xs">{tab.label}</div>
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-black/30 overflow-hidden">
                    <div className="h-[32rem] overflow-y-auto custom-scrollbar p-6">
                        {currentView === 'chat' && (
                            <EmergencyChat
                                isOnline={isOnline}
                                isMuted={isMuted}
                                emergencyMode={emergencyMode}
                                onEmergencyMode={setEmergencyMode}
                            />
                        )}

                        {currentView === 'faq' && (
                            <EmergencyFAQ
                                isOnline={isOnline}
                                emergencyMode={emergencyMode}
                            />
                        )}

                        {currentView === 'contacts' && (
                            <EmergencyContacts
                                emergencyHotline={emergencyHotline}
                                emergencyMode={emergencyMode}
                            />
                        )}

                        {currentView === 'accessibility' && (
                            <EmergencyAccessibility
                                emergencyMode={emergencyMode}
                                isMuted={isMuted}
                                onToggleMute={() => setIsMuted(!isMuted)}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};

export default AIEmergencyAssistant;