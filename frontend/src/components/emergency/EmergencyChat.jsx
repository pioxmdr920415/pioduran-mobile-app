import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send,
    Mic,
    Square,
    Bot,
    User,
    AlertTriangle,
    Clock,
    Wifi,
    WifiOff,
    Volume2,
    VolumeX,
    ArrowLeft,
    Cloud,
    CloudOff,
    Save
} from 'lucide-react';
import { useOnlineStatus } from '../../hooks/usePWA';
import offlineStorage from '../../utils/offlineStorage';

const EmergencyChat = ({ isMuted, emergencyMode, onEmergencyMode }) => {
    const navigate = useNavigate();
    const isOnline = useOnlineStatus();
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "Hello! I'm your AI Emergency Assistant. I'm here to help you with any emergency situation. How can I assist you today?",
            timestamp: new Date(),
            urgent: false
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [emergencyDetected, setEmergencyDetected] = useState(false);
    const [detectedKeywords, setDetectedKeywords] = useState([]);
    const [pendingMessages, setPendingMessages] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load cached messages on component mount
    useEffect(() => {
        const loadCachedMessages = async () => {
            try {
                const cached = await offlineStorage.getCachedData('emergency_chat_messages');
                if (cached && Array.isArray(cached)) {
                    setMessages(cached);
                }
            } catch (error) {
                console.error('Failed to load cached messages:', error);
            }
        };

        const loadPendingMessages = async () => {
            try {
                const pending = await offlineStorage.getCachedData('emergency_pending_messages');
                if (pending && Array.isArray(pending)) {
                    setPendingMessages(pending.length);
                }
            } catch (error) {
                console.error('Failed to load pending messages:', error);
            }
        };

        loadCachedMessages();
        loadPendingMessages();
    }, []);

    // Save messages to cache whenever messages change
    useEffect(() => {
        const saveMessagesToCache = async () => {
            try {
                await offlineStorage.cacheData('emergency_chat_messages', messages, 1440); // 24 hours
            } catch (error) {
                console.error('Failed to cache messages:', error);
            }
        };

        if (messages.length > 1) { // Don't cache initial message
            saveMessagesToCache();
        }
    }, [messages]);

    // Handle online/offline sync
    useEffect(() => {
        if (isOnline && pendingMessages > 0) {
            syncPendingMessages();
        }
    }, [isOnline, pendingMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const syncPendingMessages = async () => {
        setIsSyncing(true);
        try {
            const pending = await offlineStorage.getCachedData('emergency_pending_messages') || [];
            let syncedCount = 0;

            for (const pendingMessage of pending) {
                try {
                    const response = await fetch('/api/ai-chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: pendingMessage.content,
                            conversation_id: `conv_${pendingMessage.id}`
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const aiMessage = {
                            id: pendingMessage.id + 1,
                            type: 'ai',
                            content: data.response,
                            timestamp: new Date(data.timestamp),
                            urgent: pendingMessage.urgent
                        };

                        setMessages(prev => [...prev, aiMessage]);
                        syncedCount++;
                    }
                } catch (error) {
                    console.error('Failed to sync message:', error);
                }
            }

            if (syncedCount > 0) {
                // Clear synced messages from pending
                const remainingPending = pending.slice(syncedCount);
                if (remainingPending.length > 0) {
                    await offlineStorage.cacheData('emergency_pending_messages', remainingPending, 1440);
                } else {
                    await offlineStorage.deleteCachedData('emergency_pending_messages');
                }
                setPendingMessages(remainingPending.length);
            }
        } catch (error) {
            console.error('Failed to sync pending messages:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    // Emergency keyword detection
    const emergencyKeywords = [
        // Medical emergencies
        'heart attack', 'chest pain', 'difficulty breathing', 'can\'t breathe', 'stroke', 'unconscious', 'bleeding', 'seizure',
        'broken bone', 'fracture', 'burn', 'poison', 'overdose', 'allergic reaction', 'anaphylaxis',

        // Fire emergencies
        'fire', 'smoke', 'burning', 'flames', 'explosion',

        // Natural disasters
        'earthquake', 'typhoon', 'flood', 'landslide', 'storm', 'tornado',

        // Safety emergencies
        'robbery', 'assault', 'attack', 'danger', 'help', 'emergency', 'urgent',

        // Location keywords
        'where', 'location', 'address', 'nearby', 'closest', 'nearest'
    ];

    const emergencyResponses = {
        'medical': [
            "I understand this is a medical emergency. Please call 118 for ambulance services immediately.",
            "While help is on the way, here's what you can do: [First Aid Instructions]",
            "Try to stay calm and follow the operator's instructions carefully."
        ],
        'fire': [
            "Fire emergency detected! Call 118 for fire department immediately.",
            "Evacuate the area immediately if it's safe to do so.",
            "Stay low to avoid smoke inhalation and cover your mouth with a wet cloth."
        ],
        'police': [
            "Police emergency detected! Call 117 for police assistance immediately.",
            "If you're in immediate danger, find a safe location and lock yourself in if possible.",
            "Try to remain calm and provide clear information to the operator."
        ],
        'natural': [
            "I understand you're dealing with a natural disaster situation.",
            "Please follow local emergency instructions and seek shelter if needed.",
            "Stay tuned to official updates and avoid unnecessary travel."
        ]
    };

    const analyzeMessage = (message) => {
        const lowerMessage = message.toLowerCase();
        const foundKeywords = emergencyKeywords.filter(keyword =>
            lowerMessage.includes(keyword)
        );

        setDetectedKeywords(foundKeywords);

        if (foundKeywords.length > 0) {
            setEmergencyDetected(true);
            return 'emergency';
        }

        return 'normal';
    };

    const getAIResponse = (message, messageType) => {
        const lowerMessage = message.toLowerCase();

        // Location-based responses
        if (lowerMessage.includes('hospital') || lowerMessage.includes('clinic') || lowerMessage.includes('medical')) {
            return "The nearest medical facilities are:\n\n1. Pio Duran District Hospital - 5km away\n2. Albay Provincial Hospital - 25km away\n3. Bicol Medical Center - 28km away\n\nFor immediate medical emergencies, please call 118.";
        }

        if (lowerMessage.includes('police') || lowerMessage.includes('help')) {
            return "For police assistance, please call 117. This number connects you to emergency services including police, fire, and medical assistance.";
        }

        if (lowerMessage.includes('fire') || lowerMessage.includes('burning')) {
            return "For fire emergencies, please call 118 immediately. If it's safe to do so, evacuate the area and avoid smoke inhalation.";
        }

        if (lowerMessage.includes('earthquake') || lowerMessage.includes('typhoon') || lowerMessage.includes('flood')) {
            return "For natural disaster information and assistance, please call 117. Stay tuned to local news and follow official evacuation orders if issued.";
        }

        if (lowerMessage.includes('first aid') || lowerMessage.includes('cpr') || lowerMessage.includes('bandage')) {
            return "I can provide basic first aid information. However, for serious injuries, please call 118 for medical assistance immediately.";
        }

        if (lowerMessage.includes('location') || lowerMessage.includes('where')) {
            return "I'm unable to access your exact location. For emergency services, please provide your address or nearest landmark when calling 911 or 118.";
        }

        // Default responses
        if (messageType === 'emergency') {
            return "I understand this is an emergency situation. Please call the appropriate emergency number:\n\n• Medical Emergency: 118\n• Police/Fire: 911\n\nI'm here to provide information and support while you wait for help to arrive.";
        }

        return "I'm here to help with emergency information and support. If you're experiencing an emergency, please call:\n\n• Medical: 118\n• Police/Fire: 911\n\nHow else can I assist you?";
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isTyping) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // Analyze for emergency keywords
        const messageType = analyzeMessage(inputMessage);

        if (!isOnline) {
            // Offline mode - save message and provide local response
            const pendingMessage = {
                ...userMessage,
                urgent: messageType === 'emergency'
            };

            try {
                const existingPending = await offlineStorage.getCachedData('emergency_pending_messages') || [];
                const updatedPending = [...existingPending, pendingMessage];
                await offlineStorage.cacheData('emergency_pending_messages', updatedPending, 1440);
                setPendingMessages(updatedPending.length);
            } catch (error) {
                console.error('Failed to save pending message:', error);
            }

            // Provide local AI response
            const responseText = getAIResponse(inputMessage, messageType);
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: `📱 **Offline Mode**\n\n${responseText}\n\n*Your message will be synced when connection is restored.*`,
                timestamp: new Date(),
                urgent: messageType === 'emergency',
                offline: true
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
            scrollToBottom();
            return;
        }

        try {
            // Call real AI API
            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    conversation_id: `conv_${Date.now()}`
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();

            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: data.response,
                timestamp: new Date(data.timestamp),
                urgent: messageType === 'emergency'
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI chat error:', error);

            // Fallback to local response if API fails
            const responseText = getAIResponse(inputMessage, messageType);
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: `⚠️ AI service temporarily unavailable. Here's some guidance:\n\n${responseText}`,
                timestamp: new Date(),
                urgent: messageType === 'emergency'
            };

            setMessages(prev => [...prev, aiMessage]);
        } finally {
            setIsTyping(false);
            scrollToBottom();
        }
    };

    const startVoiceRecognition = () => {
        if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        setIsListening(true);
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();

        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputMessage(transcript);
            sendMessage();
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.start();
    };

    const stopVoiceRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const EmergencyAlert = () => (
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400/50 rounded-2xl p-4 mb-5 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-red-500/20 rounded-xl">
                    <AlertTriangle className="w-7 h-7 text-red-400 animate-pulse" />
                </div>
                <div>
                    <div className="text-red-300 font-bold text-base font-display">Emergency Detected</div>
                    <div className="text-red-200/80 text-sm mt-1">
                        Keywords: {detectedKeywords.slice(0, 3).join(', ')}
                    </div>
                </div>
            </div>
        </div>
    );


    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 border border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        aria-label="Go back to previous page"
                    >
                        <ArrowLeft className="w-6 h-6 text-white drop-shadow-sm" />
                    </button>
                    <div className={`p-3 rounded-2xl shadow-lg ${isOnline ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
                        {isOnline ? <Bot className="w-6 h-6 text-white" /> : <CloudOff className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                        <div className="text-white font-bold text-base font-display flex items-center gap-2">
                            AI Emergency Assistant
                            {pendingMessages > 0 && (
                                <span className="px-2 py-1 bg-blue-500/80 text-white text-xs rounded-full font-semibold animate-pulse">
                                    {pendingMessages} pending
                                </span>
                            )}
                        </div>
                        <div className="text-white/60 text-sm mt-0.5 flex items-center gap-2">
                            {isOnline ? (
                                <>
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    Online - AI Ready
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                    Offline - Local Mode
                                    {isSyncing && <span className="text-blue-400 animate-pulse">Syncing...</span>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEmergencyMode(!emergencyMode)}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${emergencyMode ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                    >
                        {emergencyMode ? '🚨 Active' : 'SOS'}
                    </button>
                </div>
            </div>

            {/* Emergency Alert */}
            {emergencyDetected && <EmergencyAlert />}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-5 pr-2 custom-scrollbar">
                {messages.map((message) => {
                    const Icon = message.type === 'user' ? User : Bot;
                    const isAI = message.type === 'ai';

                    return (
                        <div key={message.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                            <div className={`flex items-start gap-3 max-w-xs lg:max-w-md ${isAI ? 'flex-row' : 'flex-row-reverse'
                                }`}>
                                <div className={`p-2.5 rounded-2xl shadow-lg ${isAI ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'
                                    }`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className={`px-4 py-3 rounded-2xl shadow-lg ${isAI
                                        ? 'bg-gradient-to-br from-white/15 to-white/10 text-white border border-white/20'
                                        : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                                    } ${message.urgent ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-slate-900' : ''}`}>
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {message.content}
                                    </div>
                                    <div className="text-xs text-white/60 mt-2 flex items-center gap-2 flex-wrap">
                                        <Clock className="w-3 h-3" />
                                        {message.timestamp.toLocaleTimeString()}
                                        {message.offline && (
                                            <span className="px-2 py-1 bg-orange-500/30 text-orange-300 rounded-lg text-xs font-semibold border border-orange-400/30 flex items-center gap-1">
                                                <CloudOff className="w-3 h-3" />
                                                Offline
                                            </span>
                                        )}
                                        {message.urgent && (
                                            <span className="px-2 py-1 bg-red-500/30 text-red-300 rounded-lg text-xs font-semibold border border-red-400/30">
                                                🚨 URGENT
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isTyping && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="flex items-start gap-3 max-w-xs lg:max-w-md">
                            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="px-4 py-3 bg-gradient-to-br from-white/15 to-white/10 rounded-2xl border border-white/20">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/20 pt-4">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isOnline ? "Type your message..." : "Offline mode - limited responses"}
                            disabled={!isOnline}
                            className="w-full px-5 py-4 bg-gradient-to-br from-white/15 to-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 font-medium transition-all duration-300"
                        />
                        {emergencyDetected && (
                            <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 shadow-lg animate-pulse">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                        className={`p-4 rounded-2xl transition-all duration-300 shadow-lg ${isListening
                                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white animate-pulse shadow-red-500/30'
                                : 'bg-gradient-to-br from-white/20 to-white/10 text-white hover:from-white/30 hover:to-white/20 border border-white/20'
                            }`}
                        disabled={!isOnline}
                    >
                        {isListening ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isTyping || !isOnline}
                        className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/30"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center justify-between mt-3 text-xs text-white/60 px-1">
                    <div className="flex items-center gap-2">
                        {isOnline ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                <Wifi className="w-4 h-4 text-emerald-400" />
                                <span className="font-medium">Connected to AI</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <WifiOff className="w-4 h-4 text-red-400" />
                                <span className="font-medium">Offline Mode</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isMuted ? (
                            <>
                                <VolumeX className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">Voice Muted</span>
                            </>
                        ) : (
                            <>
                                <Volume2 className="w-4 h-4 text-blue-400" />
                                <span className="font-medium">Voice Enabled</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyChat;