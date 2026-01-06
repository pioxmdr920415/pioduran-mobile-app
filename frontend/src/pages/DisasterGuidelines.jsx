import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import {
  BookOpen, ChevronDown, ChevronUp, Waves, Mountain, CloudLightning, Wind, Flame, Sun, HeartPulse,
  MapPin, Shield, AlertTriangle, CheckCircle, Clock, Users, Phone, Download, Share2,
  Plus, Minus, Star, StarOff, Calendar, Home, Car, MedicalCross, BatteryCharging, Wifi
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Label } from '../components/ui/label';
import { toast } from '../hooks/use-toast';

const disasters = [
  {
    id: 'storm-surge',
    title: 'Storm Surge & Tsunami',
    icon: Waves,
    gradient: 'from-blue-500 to-cyan-500',
    category: 'Coastal',
    severity: 'High',
    duration: 'Hours to Days',
    before: [
      "Know your zone: Is your home, work, or school in a designated evacuation zone?",
      'Plan multiple evacuation routes inland and to higher ground.',
      "Learn the natural warning signs: for a tsunami, a strong, long earthquake, a sudden rise or fall in the ocean, a loud 'roaring' sound.",
      'Heed official warnings immediately. Do not wait.',
      'Prepare your Go-Bag and have it ready.',
    ],
    during: [
      'IMMEDIATELY move inland and to high ground. Do not stay to watch.',
      'Go as far inland and as high up as possible. Even a few stories in a sturdy concrete building can make a difference.',
      'If you are in a boat and time allows, move out to deep water (tsunami waves are less destructive in deep ocean).',
      'Do not return to the evacuation zone until authorities declare it safe.',
    ],
    after: [
      'Stay away from the coast. Dangerous waves can continue for hours.',
      'Stay away from damaged buildings, bridges, and infrastructure.',
      'Be cautious of floodwaters, which may be contaminated or hide debris.',
      'Listen to official sources for information about safe return and water safety.',
    ],
    checklist: [
      { id: 'zone-check', text: 'Check if your area is in an evacuation zone', category: 'Knowledge' },
      { id: 'evacuation-routes', text: 'Plan 2-3 evacuation routes to higher ground', category: 'Planning' },
      { id: 'go-bag', text: 'Prepare emergency go-bag with essentials', category: 'Supplies' },
      { id: 'family-plan', text: 'Create family communication plan', category: 'Communication' },
      { id: 'important-docs', text: 'Secure important documents in waterproof container', category: 'Documents' },
    ],
    resources: [
      { type: 'Local', name: 'Coastal Warning System', contact: 'Local Emergency Management' },
      { type: 'National', name: 'NOAA Tsunami Warning Center', contact: '1-800-XXX-XXXX' },
      { type: 'Online', name: 'Tsunami Preparedness Guide', url: 'https://www.ready.gov/tsunami' },
    ]
  },
  {
    id: 'landslide',
    title: 'Landslide',
    icon: Mountain,
    gradient: 'from-amber-500 to-orange-500',
    category: 'Geological',
    severity: 'High',
    duration: 'Minutes to Hours',
    before: [
      'Learn if your area is prone to landslides.',
      'Watch for signs like new cracks in foundations, soil moving away from foundations, tilting trees or fences.',
      'Consult a professional for land-use guidance (e.g., building retaining walls).',
      'Plan an evacuation route to a safer area, not in the path of potential flow.',
    ],
    during: [
      'If you are in a building, get to the highest level.',
      'If you are outside and near the path of a landslide, run to the nearest high ground or shelter. Do not try to outrun it.',
      'If escape is not possible, curl into a tight ball and protect your head.',
    ],
    after: [
      'Stay away from the slide area. There may be a risk of additional slides.',
      'Check for injured or trapped people near the slide, but do not enter the direct area. Call for professional help.',
      'Be aware of potential flooding, as landslides can block waterways.',
      'Report broken utility lines to the authorities.',
    ],
    checklist: [
      { id: 'slope-inspection', text: 'Inspect slopes around your property for signs of instability', category: 'Inspection' },
      { id: 'drainage-check', text: 'Ensure proper drainage to prevent soil saturation', category: 'Maintenance' },
      { id: 'emergency-route', text: 'Identify safe evacuation routes away from slopes', category: 'Planning' },
      { id: 'warning-signs', text: 'Learn to recognize landslide warning signs', category: 'Knowledge' },
      { id: 'insurance-check', text: 'Review insurance coverage for landslide damage', category: 'Financial' },
    ],
    resources: [
      { type: 'Local', name: 'Geological Survey Office', contact: 'Local Government' },
      { type: 'National', name: 'USGS Landslide Hazards Program', contact: '1-888-ASK-USGS' },
      { type: 'Online', name: 'Landslide Preparedness', url: 'https://www.usgs.gov/land-resources/landslide-hazards' },
    ]
  },
  {
    id: 'thunderstorm',
    title: 'Thunderstorm',
    icon: CloudLightning,
    gradient: 'from-gray-500 to-slate-600',
    category: 'Weather',
    severity: 'Medium',
    duration: '30 minutes to 2 hours',
    before: [
      'Secure or bring inside outdoor objects that could be blown away.',
      'Unplug sensitive electronic appliances to protect from power surges.',
      'Listen to weather forecasts for Severe Thunderstorm Warnings.',
    ],
    during: [
      'When Thunder Roars, Go Indoors! There is no safe place outside.',
      'Avoid corded phones, plumbing, and electrical appliances as lightning can travel through wiring and pipes.',
      'Stay away from windows and doors.',
      'If you are in a vehicle, it is a safe alternative. Avoid touching the metal frame.',
      'If you are caught outside with no shelter, avoid isolated trees, hilltops, and open fields. Crouch low in a ravine or valley.',
    ],
    after: [
      'Stay indoors for at least 30 minutes after the last clap of thunder.',
      'Watch for downed power lines and report them immediately.',
      'Check for property damage.',
    ],
    checklist: [
      { id: 'surge-protectors', text: 'Install surge protectors for electronics', category: 'Safety' },
      { id: 'tree-trimming', text: 'Trim trees near your home to prevent falling branches', category: 'Maintenance' },
      { id: 'weather-app', text: 'Download weather alert apps on your phone', category: 'Technology' },
      { id: 'emergency-kit', text: 'Keep flashlight and batteries accessible', category: 'Supplies' },
      { id: 'lightning-safety', text: 'Learn lightning safety procedures', category: 'Knowledge' },
    ],
    resources: [
      { type: 'Local', name: 'National Weather Service Office', contact: 'Local Weather Station' },
      { type: 'National', name: 'Storm Prediction Center', contact: '1-800-WEATHER' },
      { type: 'Online', name: 'Lightning Safety Tips', url: 'https://www.weather.gov/safety/lightning' },
    ]
  },
  {
    id: 'typhoon',
    title: 'Tropical Cyclone',
    icon: Wind,
    gradient: 'from-blue-600 to-indigo-700',
    category: 'Weather',
    severity: 'Very High',
    duration: 'Hours to Days',
    before: [
      "Know your home's vulnerability to wind and flooding.",
      'Install storm shutters or pre-cut plywood for windows.',
      'Secure or bring indoors all outdoor furniture, decorations, trash cans, etc.',
      'Trim trees and shrubs to make them more wind-resistant.',
      "Fill your vehicle's gas tank and withdraw some cash.",
    ],
    during: [
      'Stay indoors, away from windows and skylights.',
      'Take refuge in a small interior room, closet, or hallway on the lowest level that is not prone to flooding.',
      'Lie on the floor under a sturdy table or other object.',
      "Do not go outside during the 'eye' of the storm; the worst winds will resume shortly from the opposite direction.",
    ],
    after: [
      'Listen to official reports to ensure the storm has passed.',
      'Watch for fallen objects, downed power lines, and damaged structures.',
      'Do not walk or drive through floodwaters.',
      'Use flashlights, not candles, due to the risk of gas leaks.',
      'Check on your neighbors, especially the elderly or those with disabilities.',
    ],
    checklist: [
      { id: 'storm-shutters', text: 'Install storm shutters or prepare plywood for windows', category: 'Protection' },
      { id: 'roof-inspection', text: 'Inspect and repair roof for wind resistance', category: 'Maintenance' },
      { id: 'emergency-supplies', text: 'Stock 7-day supply of water, food, and medications', category: 'Supplies' },
      { id: 'evacuation-plan', text: 'Plan evacuation route and destination', category: 'Planning' },
      { id: 'important-docs', text: 'Create waterproof container for important documents', category: 'Documents' },
      { id: 'generator-safety', text: 'Learn safe generator operation if you have one', category: 'Equipment' },
    ],
    resources: [
      { type: 'Local', name: 'Emergency Management Agency', contact: 'Local Government' },
      { type: 'National', name: 'National Hurricane Center', contact: '1-800-WEATHER' },
      { type: 'Online', name: 'Hurricane Preparedness Guide', url: 'https://www.ready.gov/hurricanes' },
    ]
  },
  {
    id: 'flood',
    title: 'Flood',
    icon: Waves,
    gradient: 'from-cyan-500 to-teal-500',
    category: 'Water',
    severity: 'High',
    duration: 'Hours to Weeks',
    before: [
      'Know if you are in a floodplain.',
      'Consider purchasing flood insurance.',
      'Elevate critical utilities (furnace, water heater, electrical panel).',
      'Have a plan to move to higher floors if needed.',
    ],
    during: [
      "Turn Around, Don't Drown! Do not walk, swim, or drive through floodwaters. Six inches of moving water can knock you down; one foot can sweep a vehicle away.",
      'Evacuate if told to do so.',
      'If trapped in a building, go to its highest level. Do not enter a closed attic.',
      'If trapped in a vehicle, stay inside. If water is rising inside the vehicle, seek refuge on the roof.',
    ],
    after: [
      'Return home only when authorities say it is safe.',
      'Avoid standing water, which may be electrically charged or contaminated.',
      'Wear heavy gloves and boots during cleanup.',
      'Photograph damage for insurance claims.',
      'Be aware that floodwater can weaken roads and structures.',
    ],
    checklist: [
      { id: 'flood-insurance', text: 'Purchase flood insurance if in flood-prone area', category: 'Financial' },
      { id: 'utility-elevation', text: 'Elevate electrical panel and appliances above base flood elevation', category: 'Preparation' },
      { id: 'sandbag-supplies', text: 'Keep sandbags and plastic sheeting for emergency protection', category: 'Supplies' },
      { id: 'evacuation-route', text: 'Identify multiple evacuation routes to higher ground', category: 'Planning' },
      { id: 'important-docs', text: 'Store important documents in waterproof containers', category: 'Documents' },
      { id: 'cleanup-supplies', text: 'Prepare cleaning supplies for post-flood cleanup', category: 'Supplies' },
    ],
    resources: [
      { type: 'Local', name: 'Floodplain Management Office', contact: 'Local Government' },
      { type: 'National', name: 'FEMA Flood Map Service Center', contact: '1-800-621-FEMA' },
      { type: 'Online', name: 'Flood Safety Tips', url: 'https://www.ready.gov/floods' },
    ]
  },
  {
    id: 'earthquake',
    title: 'Earthquake',
    icon: Mountain,
    gradient: 'from-stone-500 to-gray-600',
    category: 'Geological',
    severity: 'Very High',
    duration: 'Seconds to Minutes',
    before: [
      "'Drop, Cover, and Hold On' is the single most important preparedness action.",
      'Secure heavy furniture, appliances, and water heaters to walls.',
      'Know how to turn off your gas (if you smell a leak) and water.',
      'Store heavy and breakable objects on low shelves.',
    ],
    during: [
      'DROP onto your hands and knees.',
      'COVER your head and neck under a sturdy table or desk. If no shelter is nearby, get down near an interior wall and cover your head and neck with your arms.',
      'HOLD ON to your shelter until the shaking stops.',
      'If in bed, stay there and cover your head with a pillow.',
      'Do not run outside. The danger is from falling debris and glass.',
    ],
    after: [
      'Expect aftershocks. Drop, Cover, and Hold On when they occur.',
      'Check yourself and others for injuries.',
      'If you are in a damaged building, get out and move to an open space.',
      'If you smell gas, evacuate immediately and report it.',
      'Avoid using phones except for life-threatening emergencies.',
    ],
    checklist: [
      { id: 'secure-furniture', text: 'Secure bookcases, cabinets, and heavy objects to walls', category: 'Safety' },
      { id: 'emergency-kit', text: 'Create earthquake emergency kit with water, food, and first aid', category: 'Supplies' },
      { id: 'gas-shutoff', text: 'Learn how to turn off gas, water, and electricity', category: 'Knowledge' },
      { id: 'safe-spots', text: 'Identify safe spots in each room (under sturdy furniture)', category: 'Planning' },
      { id: 'communication-plan', text: 'Establish family communication plan for reunification', category: 'Communication' },
      { id: 'structural-inspection', text: 'Have home inspected for earthquake resistance', category: 'Inspection' },
    ],
    resources: [
      { type: 'Local', name: 'Earthquake Safety Office', contact: 'Local Emergency Management' },
      { type: 'National', name: 'USGS Earthquake Hazards Program', contact: '1-800-ASK-USGS' },
      { type: 'Online', name: 'Earthquake Preparedness', url: 'https://www.ready.gov/earthquakes' },
    ]
  },
  {
    id: 'fire',
    title: 'Fire',
    icon: Flame,
    gradient: 'from-red-500 to-orange-500',
    category: 'Fire',
    severity: 'High',
    duration: 'Minutes to Days',
    before: [
      "Create a 'defensible space' by clearing flammable vegetation around your home.",
      'Have an evacuation plan for your family and pets.',
      'Keep gutters clean and remove debris from your roof.',
      'Install and test smoke alarms.',
      'Have fire extinguishers and know how to use them.',
      'Plan and practice a family escape route with two ways out of every room.',
    ],
    during: [
      'Evacuate immediately if told to do so.',
      'If trapped, call 911. Stay in a building or vehicle with windows closed. It is safer than being outside.',
      'If outside, seek shelter in a low-lying area or body of water. Cover yourself with wet clothing or a blanket.',
      'GET OUT, STAY OUT. Do not stop for belongings.',
      "Feel closed doors with the back of your hand before opening. If it's warm, use your second way out.",
      'Stay low to the floor where the air is less toxic.',
      'Call the fire department from outside.',
    ],
    after: [
      'Do not re-enter until firefighters say it is safe.',
      'Be aware of hot embers, smoldering debris, and structural damage.',
      'Wear a mask to avoid breathing ash.',
      'Watch for flare-ups.',
    ],
    checklist: [
      { id: 'defensible-space', text: 'Create 30-foot defensible space around home', category: 'Preparation' },
      { id: 'smoke-alarms', text: 'Test smoke alarms monthly and replace batteries', category: 'Safety' },
      { id: 'fire-extinguishers', text: 'Keep fire extinguishers on each floor and in kitchen', category: 'Equipment' },
      { id: 'escape-plan', text: 'Practice family fire escape plan twice a year', category: 'Planning' },
      { id: 'clean-gutters', text: 'Clean gutters and roof of debris regularly', category: 'Maintenance' },
      { id: 'emergency-kit', text: 'Prepare wildfire evacuation kit with N95 masks', category: 'Supplies' },
    ],
    resources: [
      { type: 'Local', name: 'Fire Department', contact: '911 or Local Station' },
      { type: 'National', name: 'US Fire Administration', contact: '1-800-FIRE-SAFE' },
      { type: 'Online', name: 'Fire Safety Resources', url: 'https://www.usfa.fema.gov/prevention/' },
    ]
  },
  {
    id: 'heat',
    title: 'Extreme Heat',
    icon: Sun,
    gradient: 'from-orange-400 to-amber-500',
    category: 'Environmental',
    severity: 'Medium',
    duration: 'Hours to Days',
    before: [
      'Ensure you have a way to stay cool (air conditioning, public cooling centers).',
      'Cover windows with drapes or shades to block direct sun.',
      'Have a plan for those at high risk (infants, elderly, people with chronic illnesses).',
    ],
    during: [
      'Stay indoors in air conditioning as much as possible.',
      "Drink plenty of water, even if you don't feel thirsty. Avoid alcohol and caffeine.",
      'Wear lightweight, light-colored, loose-fitting clothing.',
      'Take cool showers or baths.',
      'Never leave children or pets in a closed vehicle.',
      'Limit strenuous outdoor activity to the coolest parts of the day (early morning/evening).',
    ],
    after: [
      'Continue to hydrate.',
      'Check on neighbors, family, and friends who may be vulnerable.',
      'Be aware of signs of heat illness (dizziness, nausea, headache, confusion) and seek medical help if necessary.',
    ],
    checklist: [
      { id: 'cooling-plan', text: 'Identify cooling centers and air-conditioned public places', category: 'Planning' },
      { id: 'water-supply', text: 'Stock plenty of drinking water and electrolyte solutions', category: 'Supplies' },
      { id: 'heat-safety', text: 'Learn signs of heat exhaustion and heat stroke', category: 'Knowledge' },
      { id: 'vulnerable-check', text: 'Check on elderly, children, and those with medical conditions', category: 'Community' },
      { id: 'pet-safety', text: 'Ensure pets have shade and plenty of water', category: 'Pets' },
      { id: 'work-schedule', text: 'Adjust outdoor work schedules to avoid peak heat hours', category: 'Workplace' },
    ],
    resources: [
      { type: 'Local', name: 'Health Department Heat Line', contact: 'Local Health Office' },
      { type: 'National', name: 'CDC Heat Safety', contact: '1-800-CDC-INFO' },
      { type: 'Online', name: 'Heat Illness Prevention', url: 'https://www.cdc.gov/disasters/extremeheat/index.html' },
    ]
  },
];

const pandemicGuidelines = {
  id: 'pandemic',
  title: 'Pandemic/Health Emergency',
  icon: HeartPulse,
  gradient: 'from-red-500 to-pink-500',
  category: 'Health',
  severity: 'High',
  duration: 'Weeks to Months',
  prevention: [
    "Hand Hygiene: Wash hands with soap and water for at least 20 seconds, especially after being in public, before eating, and after coughing/sneezing. Use alcohol-based hand sanitizer (at least 60% alcohol) when soap is unavailable.",
    "Respiratory Etiquette: Wear a well-fitting, high-quality mask (e.g., N95, KN95, or surgical mask) in crowded indoor spaces or areas of high community transmission. Cough/sneeze into your elbow or a tissue, not your hands.",
    "Environmental Measures: Improve indoor ventilation by opening windows, using HEPA filters, or meeting outdoors when possible. Regularly disinfect high-touch surfaces (doorknobs, light switches, countertops, electronics) using EPA-approved disinfectants.",
    "Vaccination: Stay current with recommended vaccines (e.g., annual flu shot, COVID-19 boosters) as they are a critical tool to reduce severity and transmission."
  ],
  preparedness: [
    "Essential Supplies: Maintain a 2-week supply of prescription medications, over-the-counter fever/pain reducers, cough/cold medicine, electrolytes, vitamins, and first-aid items. Include a working thermometer, pulse oximeter, and extra hygiene supplies (soap, sanitizer, tissues, toilet paper, menstrual products).",
    "Food & Water: Keep a 2-week supply of non-perishable food, bottled water (1 gallon per person per day), and pet supplies. Prioritize foods that require minimal preparation.",
    "Documentation: Keep digital and physical copies of critical documents: medical records (insurance cards, vaccination history, prescriptions), emergency contacts, and physician phone numbers. Store digital copies in a secure, offline drive or cloud service.",
    "Emergency Plan: Designate a specific room/bathroom for isolation if needed. Create a household communication plan, including a single point-of-contact if family members are separated. Plan for childcare, pet care, and elder care if you become ill."
  ],
  isolation: [
    "Isolation Protocol: Immediately isolate any household member showing symptoms or testing positive. They should use a separate bedroom and bathroom if possible. Meals should be delivered to their door.",
    "Caregiver & Household Safety: If caring for a sick person, wear a mask and gloves when in their room. Open windows to improve airflow. The sick person should wear a mask if others must be near them. Avoid sharing personal items.",
    "Disinfection: Clean the sick person's room and bathroom regularly. Handle their laundry with gloves; wash with the warmest appropriate setting. Daily disinfect all shared high-touch surfaces (refrigerator handles, remote controls, faucets).",
    "Symptom Monitoring: Use trusted symptom-checker tools (e.g., CDC, NHS apps) and track fever, oxygen levels (with a pulse oximeter), and breathing difficulty. Know the specific 'danger signs' for the illness in question (e.g., shortness of breath, persistent chest pain, confusion, bluish lips) that warrant immediate medical care."
  ],
  community: [
    "Local Resource Mapping: Identify locations and procedures for local testing sites, respiratory clinics, pharmacy delivery options, and designated hospitals before an emergency. Know your local health department's website and alert system.",
    "Communication Networks: Join or establish neighborhood communication groups (e.g., WhatsApp, text chains, Nextdoor) to share reliable information, offer mutual aid (grocery runs for high-risk neighbors), and coordinate community support.",
    "Information Hygiene: Obtain information only from official, trusted sources (e.g., WHO, CDC, local public health authorities). Be aware of misinformation and verify alarming news before sharing.",
    "Support Systems: Check on vulnerable neighbors, elderly, or those living alone. Consider organizing a community 'buddy system' for regular wellness checks and resource sharing during a severe outbreak."
  ],
  mentalHealth: [
    "Stress Management: Acknowledge the stress of prolonged emergencies. Maintain routines where possible, take breaks from news/social media, and practice mindfulness or gentle exercise.",
    "Social Connection: Combat isolation through virtual check-ins, phone calls, and safe outdoor/distanced gatherings. Prioritize connection, especially if living alone.",
    "Seek Help: Recognize signs of acute distress (extreme anxiety, depression, insomnia) and utilize telemedicine, mental health hotlines, or employee assistance programs (EAP) for professional support."
  ],
  checklist: [
    { id: 'medical-supplies', text: 'Stock 2-week supply of prescription medications and first aid supplies', category: 'Medical' },
    { id: 'thermometer', text: 'Keep digital thermometer and pulse oximeter accessible', category: 'Medical' },
    { id: 'masks-supply', text: 'Maintain supply of high-quality masks (N95/KN95)', category: 'Protection' },
    { id: 'disinfectants', text: 'Stock EPA-approved disinfectants and cleaning supplies', category: 'Hygiene' },
    { id: 'isolation-room', text: 'Designate isolation room with separate bathroom if possible', category: 'Planning' },
    { id: 'vaccination-records', text: 'Keep updated vaccination records and health documents', category: 'Documents' },
    { id: 'mental-health', text: 'Plan mental health support and stress management activities', category: 'Wellness' },
    { id: 'community-network', text: 'Establish neighborhood support network for mutual aid', category: 'Community' },
  ],
  resources: [
    { type: 'Local', name: 'Health Department Hotline', contact: 'Local Health Office' },
    { type: 'National', name: 'CDC Pandemic Resources', contact: '1-800-CDC-INFO' },
    { type: 'Online', name: 'Pandemic Preparedness Guide', url: 'https://www.cdc.gov/preparedness/index.html' },
    { type: 'Medical', name: 'Telehealth Services', contact: 'Insurance Provider' },
  ]
};

export default function DisasterGuidelines() {
  const [expanded, setExpanded] = useState({});
  const [activeTab, setActiveTab] = useState('disaster');
  const [checklistState, setChecklistState] = useState({});
  const [showChecklists, setShowChecklists] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [sortBy, setSortBy] = useState('severity');
  const [filterCategory, setFilterCategory] = useState('All');
  const navigate = useNavigate();

  const toggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleChecklist = (disasterId, checklistId) => {
    setChecklistState(prev => ({
      ...prev,
      [disasterId]: {
        ...prev[disasterId],
        [checklistId]: !prev[disasterId]?.[checklistId]
      }
    }));
    toast.success('Checklist updated!');
  };

  const getCompletedChecklists = (disasterId) => {
    const state = checklistState[disasterId] || {};
    return Object.values(state).filter(Boolean).length;
  };

  const getTotalChecklists = (disasterId) => {
    const disaster = disasters.find(d => d.id === disasterId);
    return disaster?.checklist?.length || 0;
  };

  const getChecklistProgress = (disasterId) => {
    const completed = getCompletedChecklists(disasterId);
    const total = getTotalChecklists(disasterId);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Very High': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const sortedDisasters = [...disasters].sort((a, b) => {
    if (sortBy === 'severity') {
      const severityOrder = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return a.title.localeCompare(b.title);
  });

  const filteredDisasters = filterCategory === 'All'
    ? sortedDisasters
    : sortedDisasters.filter(d => d.category === filterCategory);

  const categories = ['All', ...new Set(disasters.map(d => d.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" data-testid="disaster-guidelines-page">
      <Header title="DISASTER GUIDELINES" showBack icon={BookOpen} />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6 pt-24 pb-24">
        {/* Enhanced Header Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Emergency Preparedness Guide</CardTitle>
                <CardDescription>Comprehensive guidelines for disaster preparedness and response</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowChecklists(!showChecklists)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {showChecklists ? 'Hide' : 'Show'} Checklists
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowResources(!showResources)}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  {showResources ? 'Hide' : 'Show'} Resources
                </Button>
              </div>
            </div>

            {/* Filters and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category-filter">Filter by Category</Label>
                <select
                  id="category-filter"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort-by">Sort By</Label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="severity">Severity</option>
                  <option value="title">Name</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Overall Preparedness</Label>
                <div className="space-y-1">
                  <Progress
                    value={Math.round(filteredDisasters.reduce((acc, d) => acc + getChecklistProgress(d.id), 0) / filteredDisasters.length)}
                    className="h-2"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Progress</span>
                    <span className="text-sm font-medium text-slate-600">
                      {Math.round(filteredDisasters.reduce((acc, d) => acc + getChecklistProgress(d.id), 0) / filteredDisasters.length)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-xl shadow-md overflow-hidden">
          <button
            onClick={() => setActiveTab('disaster')}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${activeTab === 'disaster'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-950 shadow-lg transform scale-105'
              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Disaster Guidelines</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('pandemic')}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${activeTab === 'pandemic'
              ? 'bg-gradient-to-r from-pink-400 to-red-500 text-white shadow-lg transform scale-105'
              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <HeartPulse className="w-5 h-5" />
              <span>Pandemic Guidelines</span>
            </div>
          </button>
        </div>

        {/* Disaster Guidelines Tab */}
        {activeTab === 'disaster' && (
          <div className="space-y-4">
            {filteredDisasters.map((d) => {
              const Icon = d.icon;
              const isOpen = !!expanded[d.id];
              const completedChecklists = getCompletedChecklists(d.id);
              const totalChecklists = getTotalChecklists(d.id);
              const progress = getChecklistProgress(d.id);

              return (
                <Card key={d.id} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-testid={`disaster-${d.id}`}>
                  <CardHeader className="p-0">
                    <button
                      onClick={() => toggle(d.id)}
                      className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                      data-testid={`disaster-toggle-${d.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${d.gradient} shadow`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900">{d.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Badge variant="secondary" className={`bg-gradient-to-r ${getSeverityColor(d.severity)} text-white text-xs px-1 py-0`}>
                                {d.severity}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {d.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {d.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {totalChecklists > 0 && (
                            <div className="text-right">
                              <div className="text-xs font-medium text-slate-600">{completedChecklists}/{totalChecklists}</div>
                              <Progress value={progress} className="w-16 h-1.5 mt-0.5" />
                            </div>
                          )}
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </button>
                  </CardHeader>

                  {isOpen && (
                    <CardContent className="space-y-4 animate-fadeIn" data-testid={`disaster-content-${d.id}`}>
                      {/* Enhanced Before Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-base font-bold text-blue-900 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            BEFORE: Preparation & Prevention
                          </h4>
                          {showChecklists && totalChecklists > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/emergency-plan')}
                              className="flex items-center gap-1 text-xs"
                            >
                              <Plus className="w-3 h-3" />
                              View Checklist
                            </Button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <ul className="space-y-1">
                            {d.before.map((item, idx) => (
                              <li key={idx} className="text-slate-700 text-xs flex gap-2 items-start">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                          {showChecklists && d.checklist && (
                            <div className="space-y-2">
                              <h5 className="font-semibold text-blue-800 text-sm">Preparedness Checklist</h5>
                              {d.checklist.map((item) => (
                                <div key={item.id} className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm">
                                  <input
                                    type="checkbox"
                                    checked={checklistState[d.id]?.[item.id] || false}
                                    onChange={() => toggleChecklist(d.id, item.id)}
                                    className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <div>
                                    <span className="text-xs font-medium text-slate-700">{item.text}</span>
                                    <Badge variant="outline" className="ml-1 text-xs">{item.category}</Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* During Section */}
                      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border-l-4 border-red-500">
                        <h4 className="text-base font-bold text-red-900 flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-5 h-5" />
                          DURING: Immediate Response
                        </h4>
                        <ul className="space-y-1">
                          {d.during.map((item, idx) => (
                            <li key={idx} className="text-slate-700 text-xs flex gap-2 items-start">
                              <span className="text-red-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* After Section */}
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border-l-4 border-green-500">
                        <h4 className="text-base font-bold text-green-900 flex items-center gap-2 mb-3">
                          <Users className="w-5 h-5" />
                          AFTER: Recovery & Safety
                        </h4>
                        <ul className="space-y-1">
                          {d.after.map((item, idx) => (
                            <li key={idx} className="text-slate-700 text-xs flex gap-2 items-start">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Resources Section */}
                      {showResources && d.resources && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-100 rounded-xl p-4 border-l-4 border-purple-500">
                          <h4 className="text-base font-bold text-purple-900 flex items-center gap-2 mb-3">
                            <BookOpen className="w-5 h-5" />
                            Emergency Resources
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            {d.resources.map((resource, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-md shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="secondary" className="text-xs">{resource.type}</Badge>
                                  <Phone className="w-3 h-3 text-slate-400" />
                                </div>
                                <h5 className="font-semibold text-slate-800 text-sm">{resource.name}</h5>
                                <p className="text-xs text-slate-600 mt-1">{resource.contact}</p>
                                {resource.url && (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center gap-1"
                                  >
                                    Visit Website <Download className="w-2 h-2" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Pandemic Guidelines Tab */}
        {activeTab === 'pandemic' && (
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${pandemicGuidelines.gradient} shadow-lg`}>
                    <HeartPulse className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">{pandemicGuidelines.title}</CardTitle>
                    <CardDescription>Comprehensive health emergency preparedness and response</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">Severity: {pandemicGuidelines.severity}</div>
                  <div className="text-sm text-slate-600">Duration: {pandemicGuidelines.duration}</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Enhanced Prevention Section */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-l-4 border-blue-500">
                <h4 className="text-lg font-bold text-blue-900 flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6" />
                  PREVENTION: Stay Safe & Healthy
                </h4>
                <ul className="space-y-3">
                  {pandemicGuidelines.prevention.map((item, idx) => (
                    <li key={idx} className="text-slate-700 text-sm flex gap-3 items-start">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Enhanced Preparedness Section */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-l-4 border-amber-500">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-amber-900 flex items-center gap-3">
                    <Home className="w-6 h-6" />
                    PREPAREDNESS: Build Your Emergency Kit
                  </h4>
                  {showChecklists && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/emergency-plan')}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      View Full Checklist
                    </Button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-3">
                    {pandemicGuidelines.preparedness.map((item, idx) => (
                      <li key={idx} className="text-slate-700 text-sm flex gap-3 items-start">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {showChecklists && pandemicGuidelines.checklist && (
                    <div className="space-y-3">
                      <h5 className="font-semibold text-amber-800">Health Emergency Checklist</h5>
                      {pandemicGuidelines.checklist.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                          <input
                            type="checkbox"
                            checked={checklistState['pandemic']?.[item.id] || false}
                            onChange={() => toggleChecklist('pandemic', item.id)}
                            className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-slate-700">{item.text}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{item.category}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Isolation Section */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border-l-4 border-red-500">
                <h4 className="text-lg font-bold text-red-900 flex items-center gap-3 mb-4">
                  <Home className="w-6 h-6" />
                  ISOLATION: Protect Yourself & Others
                </h4>
                <ul className="space-y-3">
                  {pandemicGuidelines.isolation.map((item, idx) => (
                    <li key={idx} className="text-slate-700 text-sm flex gap-3 items-start">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Community Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-500">
                <h4 className="text-lg font-bold text-green-900 flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6" />
                  COMMUNITY: Stay Connected & Informed
                </h4>
                <ul className="space-y-3">
                  {pandemicGuidelines.community.map((item, idx) => (
                    <li key={idx} className="text-slate-700 text-sm flex gap-3 items-start">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mental Health Section */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border-l-4 border-purple-500">
                <h4 className="text-lg font-bold text-purple-900 flex items-center gap-3 mb-4">
                  <HeartPulse className="w-6 h-6" />
                  MENTAL HEALTH: Stay Resilient
                </h4>
                <ul className="space-y-3">
                  {pandemicGuidelines.mentalHealth.map((item, idx) => (
                    <li key={idx} className="text-slate-700 text-sm flex gap-3 items-start">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pandemic Resources */}
              {showResources && pandemicGuidelines.resources && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-l-4 border-indigo-500">
                  <h4 className="text-lg font-bold text-indigo-900 flex items-center gap-3 mb-4">
                    <BookOpen className="w-6 h-6" />
                    Health Emergency Resources
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {pandemicGuidelines.resources.map((resource, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">{resource.type}</Badge>
                          <Phone className="w-4 h-4 text-slate-400" />
                        </div>
                        <h5 className="font-semibold text-slate-800">{resource.name}</h5>
                        <p className="text-sm text-slate-600 mt-1">{resource.contact}</p>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center gap-1"
                          >
                            Visit Website <Download className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      <BottomNav />
    </div>
  );
}