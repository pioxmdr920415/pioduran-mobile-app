import React, { useState } from 'react';
import {
    Phone,
    MapPin,
    Ambulance,
    FireExtinguisher,
    Shield,
    Users,
    Clock,
    Star,
    Copy,
    Check,
    ExternalLink,
    AlertTriangle,
    HeartPulse,
    Building2,
    Radio,
    Map,
    PlusCircle
} from 'lucide-react';

const EmergencyContacts = ({ emergencyHotline, emergencyMode }) => {
    const [copiedContact, setCopiedContact] = useState(null);
    const [selectedService, setSelectedService] = useState('all');

    // Emergency services data
    const emergencyServices = [
        {
            id: 'police',
            name: 'Police Emergency',
            number: '117',
            icon: Shield,
            color: 'bg-blue-500',
            description: 'Report crimes, disturbances, or suspicious activities',
            priority: 'high',
            available: '24/7'
        },
        {
            id: 'fire',
            name: 'Fire Department',
            number: '118',
            icon: FireExtinguisher,
            color: 'bg-red-500',
            description: 'Fire emergencies, rescue operations, hazardous materials',
            priority: 'critical',
            available: '24/7'
        },
        {
            id: 'ambulance',
            name: 'Medical Emergency',
            number: '118',
            icon: HeartPulse,
            color: 'bg-red-600',
            description: 'Medical emergencies, accidents, serious injuries',
            priority: 'critical',
            available: '24/7'
        },
        {
            id: 'disaster',
            name: 'Disaster Hotline',
            number: '117',
            icon: AlertTriangle,
            color: 'bg-orange-500',
            description: 'Typhoons, floods, earthquakes, and other disasters',
            priority: 'high',
            available: '24/7'
        },
        {
            id: 'coastguard',
            name: 'Coast Guard',
            number: '117',
            icon: Map,
            color: 'bg-blue-600',
            description: 'Maritime emergencies, water rescues',
            priority: 'high',
            available: '24/7'
        }
    ];

    // Local medical facilities
    const medicalFacilities = [
        {
            name: 'Pio Duran District Hospital',
            type: 'District Hospital',
            address: 'Pio Duran, Albay',
            contact: '(052) 123-4567',
            services: ['Emergency Room', 'Outpatient', 'Maternity'],
            distance: '5 km'
        },
        {
            name: 'Albay Provincial Hospital',
            type: 'Provincial Hospital',
            address: 'Legazpi City, Albay',
            contact: '(052) 742-1234',
            services: ['Emergency Room', 'Surgery', 'ICU', 'Pediatrics'],
            distance: '25 km'
        },
        {
            name: 'Bicol Medical Center',
            type: 'Regional Hospital',
            address: 'Legazpi City, Albay',
            contact: '(052) 820-1234',
            services: ['Emergency Room', 'Specialized Care', 'Trauma Center'],
            distance: '28 km'
        }
    ];

    // Important local numbers
    const localNumbers = [
        {
            category: 'Government',
            contacts: [
                { name: 'MDRRMO Pio Duran', number: '(052) 123-4567', priority: 'high' },
                { name: 'Municipal Hall', number: '(052) 123-4568', priority: 'medium' },
                { name: 'Barangay Hall', number: '(052) 123-4569', priority: 'medium' }
            ]
        },
        {
            category: 'Utilities',
            contacts: [
                { name: 'Electric Cooperative', number: '162', priority: 'medium' },
                { name: 'Water District', number: '(052) 123-4570', priority: 'medium' },
                { name: 'Telephone', number: '111', priority: 'low' }
            ]
        },
        {
            category: 'Community',
            contacts: [
                { name: 'Neighborhood Watch', number: '(052) 123-4571', priority: 'medium' },
                { name: 'Religious Leaders', number: '(052) 123-4572', priority: 'low' },
                { name: 'School Principal', number: '(052) 123-4573', priority: 'medium' }
            ]
        }
    ];

    const copyToClipboard = async (text, contactId) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedContact(contactId);
            setTimeout(() => setCopiedContact(null), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const makeCall = (number) => {
        window.open(`tel:${number}`);
    };

    const getDirections = (address) => {
        const encodedAddress = encodeURIComponent(address);
        window.open(`https://maps.google.com/?q=${encodedAddress}`);
    };

    const EmergencyIcon = ({ Icon, color }) => (
        <div className={`p-3 rounded-full ${color} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Quick Dial Section */}
            <div className="bg-gradient-to-r from-red-500/20 to-blue-500/20 border border-white/20 rounded-xl p-4">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Quick Emergency Numbers
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {emergencyServices.map((service) => {
                        const Icon = service.icon;
                        return (
                            <div key={service.id} className="bg-white/10 rounded-xl p-4">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`p-3 rounded-xl ${service.color} shadow-lg flex-shrink-0`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white font-bold text-base">{service.name}</div>
                                            <div className="text-white/70 text-sm mt-1">{service.number}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => copyToClipboard(service.number, service.id)}
                                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            {copiedContact === service.id ? (
                                                <Check className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <Copy className="w-5 h-5 text-white/60" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => makeCall(service.number)}
                                            className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg transition-colors"
                                        >
                                            <Phone className="w-5 h-5 text-green-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-white/60 text-xs leading-relaxed">
                                    {service.description}
                                </div>
                                <div className="flex items-center justify-between text-xs text-white/60 mt-2 pt-2 border-t border-white/10">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {service.available}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full ${service.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                            service.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {service.priority.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {[
                    { key: 'all', label: 'All Services', icon: Users },
                    { key: 'medical', label: 'Medical', icon: HeartPulse },
                    { key: 'fire', label: 'Fire', icon: FireExtinguisher },
                    { key: 'police', label: 'Police', icon: Shield },
                    { key: 'disaster', label: 'Disaster', icon: AlertTriangle }
                ].map((filter) => {
                    const Icon = filter.icon;
                    const isActive = selectedService === filter.key;

                    return (
                        <button
                            key={filter.key}
                            onClick={() => setSelectedService(filter.key)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${isActive
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {filter.label}
                        </button>
                    );
                })}
            </div>

            {/* Emergency Services List */}
            <div className="space-y-3">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Radio className="w-5 h-5" />
                    Emergency Services Details
                </h3>

                {emergencyServices
                    .filter(service => selectedService === 'all' || service.id === selectedService)
                    .map((service) => {
                        const Icon = service.icon;
                        return (
                            <div key={service.id} className="bg-white/10 border border-white/20 rounded-xl p-4">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <EmergencyIcon Icon={Icon} color={service.color} />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-semibold text-base">{service.name}</h4>
                                            <p className="text-white/70 text-sm mt-1">{service.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => copyToClipboard(service.number, service.id)}
                                            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm whitespace-nowrap transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </button>
                                        <button
                                            onClick={() => makeCall(service.number)}
                                            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold text-sm whitespace-nowrap transition-colors"
                                        >
                                            <Phone className="w-4 h-4" />
                                            Call
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-white/60 pt-3 border-t border-white/10">
                                    <span>Available: {service.available}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${service.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                            service.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {service.priority.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
            </div>

            {/* Medical Facilities */}
            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Nearest Medical Facilities
                </h3>
                <div className="space-y-3">
                    {medicalFacilities.map((facility, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h4 className="text-white font-semibold">{facility.name}</h4>
                                    <p className="text-white/70 text-sm">{facility.type}</p>
                                    <p className="text-white/60 text-xs mt-1">{facility.address}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => makeCall(facility.contact)}
                                        className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
                                    >
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => getDirections(facility.address)}
                                        className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white"
                                    >
                                        <Map className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                    {facility.services.map((service, serviceIndex) => (
                                        <span key={serviceIndex} className="px-2 py-1 bg-white/20 text-white/80 text-xs rounded-full">
                                            {service}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-white/60 text-sm">{facility.distance} away</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Local Numbers */}
            <div className="space-y-3">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Local Important Numbers
                </h3>

                {localNumbers.map((category, index) => (
                    <div key={index} className="bg-white/10 border border-white/20 rounded-xl p-4">
                        <h4 className="text-white font-semibold mb-3">{category.category}</h4>
                        <div className="space-y-2">
                            {category.contacts.map((contact, contactIndex) => (
                                <div key={contactIndex} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <div>
                                        <div className="text-white font-medium">{contact.name}</div>
                                        <div className="text-white/60 text-sm">{contact.number}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => copyToClipboard(contact.number, `${category.category}-${contactIndex}`)}
                                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                                        >
                                            <Copy className="w-4 h-4 text-white" />
                                        </button>
                                        <button
                                            onClick={() => makeCall(contact.number)}
                                            className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Emergency Tips */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-white/20 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Emergency Calling Tips
                </h3>
                <ul className="text-white/80 text-sm space-y-1">
                    <li>• Stay calm and speak clearly</li>
                    <li>• Provide your exact location</li>
                    <li>• Describe the emergency clearly</li>
                    <li>• Follow operator instructions</li>
                    <li>• Don't hang up until told to do so</li>
                    <li>• Keep your phone charged and accessible</li>
                </ul>
            </div>
        </div>
    );
};

export default EmergencyContacts;