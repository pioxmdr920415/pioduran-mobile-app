import React, { useState, useEffect } from 'react';
import {
    Volume2,
    VolumeX,
    Eye,
    EyeOff,
    Contrast,
    Monitor,
    Smartphone,
    Accessibility,
    HelpCircle,
    AlertTriangle,
    Bell,
    Settings,
    Check
} from 'lucide-react';

const EmergencyAccessibility = ({ emergencyMode, isMuted, onToggleMute }) => {
    const [highContrast, setHighContrast] = useState(false);
    const [largeText, setLargeText] = useState(false);
    const [screenReaderMode, setScreenReaderMode] = useState(false);
    const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
    const [emergencyAlerts, setEmergencyAlerts] = useState(true);

    useEffect(() => {
        // Apply accessibility settings to document
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }

        if (largeText) {
            document.body.classList.add('large-text');
        } else {
            document.body.classList.remove('large-text');
        }

        if (screenReaderMode) {
            document.body.classList.add('screen-reader');
        } else {
            document.body.classList.remove('screen-reader');
        }

        return () => {
            document.body.classList.remove('high-contrast', 'large-text', 'screen-reader');
        };
    }, [highContrast, largeText, screenReaderMode]);

    const accessibilityFeatures = [
        {
            id: 'mute',
            label: 'Audio Alerts',
            description: 'Enable/disable emergency sound notifications',
            icon: isMuted ? VolumeX : Volume2,
            action: onToggleMute,
            enabled: !isMuted
        },
        {
            id: 'contrast',
            label: 'High Contrast',
            description: 'Improve visibility for low vision users',
            icon: Contrast,
            action: () => setHighContrast(!highContrast),
            enabled: highContrast
        },
        {
            id: 'large-text',
            label: 'Large Text',
            description: 'Increase text size for better readability',
            icon: Monitor,
            action: () => setLargeText(!largeText),
            enabled: largeText
        },
        {
            id: 'screen-reader',
            label: 'Screen Reader',
            description: 'Optimize for screen reader compatibility',
            icon: Accessibility,
            action: () => setScreenReaderMode(!screenReaderMode),
            enabled: screenReaderMode
        },
        {
            id: 'alerts',
            label: 'Emergency Alerts',
            description: 'Enable visual emergency notifications',
            icon: Bell,
            action: () => setEmergencyAlerts(!emergencyAlerts),
            enabled: emergencyAlerts
        }
    ];

    const emergencyGuides = [
        {
            title: 'For Visually Impaired Users',
            steps: [
                'Use screen reader mode for audio descriptions',
                'Enable high contrast for better visibility',
                'Use large text for easier reading',
                'Listen for audio emergency alerts'
            ]
        },
        {
            title: 'For Hearing Impaired Users',
            steps: [
                'Use visual emergency alerts',
                'Enable vibration notifications',
                'Look for flashing emergency indicators',
                'Use text-based emergency information'
            ]
        },
        {
            title: 'For Motor Impaired Users',
            steps: [
                'Use voice commands when available',
                'Enable large touch targets',
                'Use simplified navigation',
                'Set up emergency shortcuts'
            ]
        }
    ];

    const AccessibilityIcon = ({ Icon, enabled }) => (
        <div className={`p-2 rounded-lg transition-all ${enabled
            ? 'bg-blue-500 text-white'
            : 'bg-gray-500 text-gray-300'
            }`}>
            <Icon className="w-5 h-5" />
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Accessibility Toggle */}
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <Accessibility className="w-6 h-6 text-blue-400" />
                        <div>
                            <h3 className="text-white font-semibold">Accessibility Settings</h3>
                            <p className="text-white/60 text-sm">Customize for your needs</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
                        className={`p-2 rounded-lg transition-colors ${showAccessibilityPanel ? 'bg-blue-500 text-white' : 'bg-white/20 text-white'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                {/* Quick Toggle Buttons */}
                <div className="grid grid-cols-1 gap-3">
                    {accessibilityFeatures.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <button
                                key={feature.id}
                                onClick={feature.action}
                                className={`flex items-start gap-3 p-4 rounded-xl transition-all ${feature.enabled
                                    ? 'bg-blue-500/20 border-2 border-blue-400/50 text-blue-300'
                                    : 'bg-white/10 hover:bg-white/20 text-white/80 border-2 border-transparent'
                                    }`}
                                aria-pressed={feature.enabled}
                                aria-label={feature.label}
                            >
                                <AccessibilityIcon Icon={Icon} enabled={feature.enabled} />
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-base">{feature.label}</div>
                                    <div className="text-sm opacity-75 mt-1">{feature.description}</div>
                                </div>
                                {feature.enabled && (
                                    <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Emergency Mode Accessibility */}
            {emergencyMode && (
                <div className="bg-gradient-to-r from-red-500/20 to-blue-500/20 border border-white/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-400 animate-pulse" />
                        <div>
                            <h3 className="text-white font-bold">Emergency Mode Active</h3>
                            <p className="text-white/80 text-sm">Accessibility features optimized</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white/10 rounded-lg p-3">
                            <h4 className="text-white font-semibold mb-2">Recommended Settings:</h4>
                            <ul className="text-white/70 text-sm space-y-1">
                                <li>• High contrast enabled for visibility</li>
                                <li>• Audio alerts active for notifications</li>
                                <li>• Large text for easy reading</li>
                                <li>• Screen reader compatibility</li>
                            </ul>
                        </div>

                        <div className="bg-white/10 rounded-lg p-3">
                            <h4 className="text-white font-semibold mb-2">Quick Actions:</h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setHighContrast(true)}
                                    className="px-3 py-2 bg-yellow-500 text-black rounded-lg font-semibold"
                                >
                                    Enable High Contrast
                                </button>
                                <button
                                    onClick={() => setLargeText(true)}
                                    className="px-3 py-2 bg-blue-500 text-white rounded-lg font-semibold"
                                >
                                    Large Text
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Settings Panel */}
            {showAccessibilityPanel && (
                <div className="bg-white/10 border border-white/20 rounded-xl p-4 space-y-4">
                    <h3 className="text-white font-semibold">Detailed Settings</h3>

                    {/* High Contrast Settings */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={highContrast}
                                onChange={() => setHighContrast(!highContrast)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border-2 transition-colors ${highContrast ? 'bg-blue-500 border-blue-500' : 'border-white/50'
                                }`}>
                                {highContrast && <Check className="w-3 h-3 text-white mt-0.5 ml-0.5" />}
                            </div>
                            <div>
                                <div className="text-white font-medium">High Contrast Mode</div>
                                <div className="text-white/60 text-sm">Improves visibility for low vision users</div>
                            </div>
                        </label>
                    </div>

                    {/* Large Text Settings */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={largeText}
                                onChange={() => setLargeText(!largeText)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border-2 transition-colors ${largeText ? 'bg-blue-500 border-blue-500' : 'border-white/50'
                                }`}>
                                {largeText && <Check className="w-3 h-3 text-white mt-0.5 ml-0.5" />}
                            </div>
                            <div>
                                <div className="text-white font-medium">Large Text</div>
                                <div className="text-white/60 text-sm">Increases text size for better readability</div>
                            </div>
                        </label>
                    </div>

                    {/* Screen Reader Settings */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={screenReaderMode}
                                onChange={() => setScreenReaderMode(!screenReaderMode)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border-2 transition-colors ${screenReaderMode ? 'bg-blue-500 border-blue-500' : 'border-white/50'
                                }`}>
                                {screenReaderMode && <Check className="w-3 h-3 text-white mt-0.5 ml-0.5" />}
                            </div>
                            <div>
                                <div className="text-white font-medium">Screen Reader Mode</div>
                                <div className="text-white/60 text-sm">Optimizes for screen reader compatibility</div>
                            </div>
                        </label>
                    </div>

                    {/* Emergency Alerts Settings */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={emergencyAlerts}
                                onChange={() => setEmergencyAlerts(!emergencyAlerts)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border-2 transition-colors ${emergencyAlerts ? 'bg-red-500 border-red-500' : 'border-white/50'
                                }`}>
                                {emergencyAlerts && <Check className="w-3 h-3 text-white mt-0.5 ml-0.5" />}
                            </div>
                            <div>
                                <div className="text-white font-medium">Emergency Visual Alerts</div>
                                <div className="text-white/60 text-sm">Enable flashing notifications for emergencies</div>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {/* Emergency Accessibility Guides */}
            <div className="space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-400" />
                    Emergency Accessibility Guides
                </h3>

                {emergencyGuides.map((guide, index) => (
                    <div key={index} className="bg-white/10 border border-white/20 rounded-xl p-4">
                        <h4 className="text-white font-semibold mb-2">{guide.title}</h4>
                        <ul className="text-white/80 space-y-1">
                            {guide.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-0.5">•</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Accessibility Tips */}
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/20 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-green-400" />
                    Accessibility Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white/80 text-sm">
                    <div>
                        <strong>For Better Experience:</strong>
                        <ul className="mt-1 space-y-1">
                            <li>• Enable high contrast in low light</li>
                            <li>• Use large text for easier reading</li>
                            <li>• Keep audio alerts on for emergencies</li>
                        </ul>
                    </div>
                    <div>
                        <strong>In Emergency Mode:</strong>
                        <ul className="mt-1 space-y-1">
                            <li>• All accessibility features auto-enabled</li>
                            <li>• Emergency alerts prioritized</li>
                            <li>• Simplified navigation activated</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyAccessibility;