import React, { useState, useEffect } from 'react';
import { Search, BookOpen, AlertTriangle, Heart, Shield, MapPin, Clock, Droplet, Flame, CloudRain, Wind, Users, Home, Car, Phone, Plus } from 'lucide-react';

const EmergencyFAQ = ({ isOnline, emergencyMode }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedItems, setExpandedItems] = useState(new Set());

    // Comprehensive FAQ database
    const faqData = [
        {
            id: 1,
            category: 'medical',
            title: 'How to perform CPR',
            icon: Heart,
            content: `**CPR Steps (Adult):**
1. Check responsiveness and breathing
2. Call emergency services (117)
3. Place hands on center of chest
4. Push hard and fast (100-120 compressions/minute)
5. Give 2 rescue breaths after every 30 compressions
6. Continue until help arrives or person starts breathing

**Important:** If untrained, perform hands-only CPR (compressions only).`,
            severity: 'critical',
            offline: true
        },
        {
            id: 2,
            category: 'medical',
            title: 'Treating severe bleeding',
            icon: Droplet,
            content: `**Stop Bleeding:**
1. Apply direct pressure with clean cloth
2. Elevate the injured area if possible
3. Apply pressure to pressure points if needed
4. Use tourniquet only as last resort
5. Keep person warm and lying down
6. Call emergency services immediately

**Warning:** Do not remove embedded objects.`,
            severity: 'critical',
            offline: true
        },
        {
            id: 3,
            category: 'fire',
            title: 'House fire evacuation',
            icon: Flame,
            content: `**Fire Safety:**
1. Stay low to avoid smoke inhalation
2. Feel doors before opening (hot = fire on other side)
3. Use alternate exits if primary is blocked
4. Crawl to safety if smoke is thick
5. Never use elevators during fire
6. Meet at predetermined location outside
7. Call fire department from safe location

**Prevention:** Install smoke detectors, have fire extinguishers accessible.`,
            severity: 'critical',
            offline: true
        },
        {
            id: 4,
            category: 'natural',
            title: 'Typhoon preparation',
            icon: CloudRain,
            content: `**Before Typhoon:**
1. Stock emergency supplies (3-7 days)
2. Secure windows and doors
3. Trim trees and secure loose objects
4. Fill water containers
5. Charge all devices
6. Prepare emergency kit
7. Know evacuation routes

**During Typhoon:**
1. Stay indoors away from windows
2. Avoid using candles
3. Keep emergency radio on
4. Monitor official updates`,
            severity: 'high',
            offline: true
        },
        {
            id: 5,
            category: 'natural',
            title: 'Earthquake safety',
            icon: Wind,
            content: `**During Earthquake:**
DROP to hands and knees
COVER head and neck under sturdy furniture
HOLD ON until shaking stops

**If outdoors:**
Move to open area away from buildings, trees, streetlights
Stay there until shaking stops

**After earthquake:**
Check for injuries and hazards
Expect aftershocks
Listen for emergency information`,
            severity: 'high',
            offline: true
        },
        {
            id: 6,
            category: 'safety',
            title: 'Home safety checklist',
            icon: Home,
            content: `**Emergency Kit Essentials:**
- Water (1 gallon per person per day)
- Non-perishable food (3-7 days)
- First aid kit with supplies
- Flashlight with extra batteries
- Battery-powered radio
- Personal documents (copies)
- Cash in small denominations
- Important medications
- Sanitation supplies
- Whistle for signaling

**Safety Measures:**
- Know how to turn off utilities
- Have multiple escape routes
- Keep emergency numbers accessible
- Regularly check and update supplies`,
            severity: 'medium',
            offline: true
        },
        {
            id: 7,
            category: 'transportation',
            title: 'Car accident response',
            icon: Car,
            content: `**After Accident:**
1. Check for injuries
2. Move to safe location if possible
3. Call emergency services (117)
4. Exchange information with other drivers
5. Take photos of damage and scene
6. Get witness information
7. Report to insurance company

**If injured:**
- Do not move if serious injury suspected
- Call for medical help immediately
- Keep person warm and calm
- Monitor breathing and consciousness`,
            severity: 'high',
            offline: true
        },
        {
            id: 8,
            category: 'communication',
            title: 'Emergency communication plan',
            icon: Phone,
            content: `**Family Communication Plan:**
1. Choose out-of-area contact person
2. Share emergency contact information
3. Establish meeting places
4. Know school/work emergency procedures
5. Keep emergency numbers accessible
6. Practice the plan regularly

**During Emergency:**
- Text instead of call (less network strain)
- Use social media for updates
- Check local emergency alerts
- Follow official instructions`,
            severity: 'medium',
            offline: true
        },
        {
            id: 9,
            category: 'firstaid',
            title: 'Basic first aid supplies',
            icon: Plus,
            content: `**First Aid Kit Contents:**
- Adhesive bandages (various sizes)
- Sterile gauze pads and roller
- Adhesive tape
- Antiseptic wipes or solution
- Scissors and tweezers
- Disposable gloves
- Thermometer
- Pain relievers (ibuprofen, acetaminophen)
- Antihistamine
- Burn ointment
- Elastic bandage for sprains
- Cold pack
- Emergency blanket

**Maintenance:**
- Check expiration dates regularly
- Replace used items immediately
- Store in waterproof container
- Keep in easily accessible location`,
            severity: 'medium',
            offline: true
        },
        {
            id: 10,
            category: 'evacuation',
            title: 'Community evacuation',
            icon: Users,
            content: `**Evacuation Preparedness:**
1. Know your evacuation zone
2. Have multiple evacuation routes planned
3. Prepare emergency kit for each family member
4. Arrange transportation if needed
5. Plan for pets and special needs
6. Secure your home before leaving
7. Take important documents and medications
8. Follow official evacuation orders immediately

**During Evacuation:**
- Leave immediately when ordered
- Take emergency kit and important items
- Help neighbors if possible
- Stay informed through official channels
- Do not return until declared safe`,
            severity: 'high',
            offline: true
        }
    ];

    const categories = [
        { key: 'all', label: 'All', icon: BookOpen, color: 'bg-blue-500' },
        { key: 'medical', label: 'Medical', icon: Heart, color: 'bg-red-500' },
        { key: 'fire', label: 'Fire Safety', icon: Flame, color: 'bg-orange-500' },
        { key: 'natural', label: 'Natural Disasters', icon: CloudRain, color: 'bg-green-500' },
        { key: 'safety', label: 'Home Safety', icon: Home, color: 'bg-yellow-500' },
        { key: 'transportation', label: 'Transportation', icon: Car, color: 'bg-purple-500' },
        { key: 'firstaid', label: 'First Aid', icon: Plus, color: 'bg-pink-500' },
        { key: 'evacuation', label: 'Evacuation', icon: Users, color: 'bg-indigo-500' }
    ];

    const filteredFAQs = faqData.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleItem = (id) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search emergency information..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = selectedCategory === category.key;

                    return (
                        <button
                            key={category.key}
                            onClick={() => setSelectedCategory(category.key)}
                            className={`p-3 rounded-xl text-white font-medium transition-all ${isActive ? `${category.color} shadow-lg scale-105` : 'bg-white/20 hover:bg-white/30'
                                }`}
                        >
                            <Icon className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-xs">{category.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between text-white/80 text-sm">
                <span>{filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''}</span>
                {!isOnline && (
                    <span className="flex items-center gap-1 text-yellow-400">
                        <WifiOff className="w-4 h-4" />
                        Offline Mode
                    </span>
                )}
            </div>

            {/* FAQ Items */}
            <div className="space-y-3">
                {filteredFAQs.map((item) => {
                    const Icon = item.icon;
                    const isExpanded = expandedItems.has(item.id);

                    return (
                        <div
                            key={item.id}
                            className={`bg-white/10 border border-white/20 rounded-xl overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-blue-400' : 'hover:bg-white/15'
                                }`}
                        >
                            <button
                                onClick={() => toggleItem(item.id)}
                                className="w-full p-4 text-left flex items-start justify-between gap-3"
                            >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className={`p-2 rounded-lg ${getSeverityColor(item.severity)} flex-shrink-0`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                                        <p className="text-white/70 text-xs mt-1 line-clamp-2">{item.content.split('\n')[0]}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {item.offline && (
                                        <span className="hidden sm:inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full whitespace-nowrap">
                                            Offline
                                        </span>
                                    )}
                                    <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                        <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="px-4 pb-4 border-t border-white/20 pt-4">
                                    <div className="text-white/90 whitespace-pre-line text-sm leading-relaxed">
                                        {item.content}
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                item.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {item.severity.toUpperCase()}
                                        </span>
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-semibold">
                                            {categories.find(c => c.key === item.category)?.label || item.category}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Emergency Tips */}
            {selectedCategory === 'all' && searchQuery === '' && (
                <div className="bg-gradient-to-r from-red-500/20 to-blue-500/20 border border-white/20 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        Emergency Tips
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-white/80 text-sm">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Always keep emergency numbers accessible
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Practice emergency plans regularly
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Time is critical in medical emergencies
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Know your location for accurate help
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmergencyFAQ;