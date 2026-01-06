import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Plus, Trash2, Edit, Save, MapPin, Users, Briefcase, Calendar, PawPrint, Phone, Home, Car, Download, Share2 } from 'lucide-react';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';

const EmergencyPlan = () => {
  const [activeTab, setActiveTab] = useState('meeting-points');
  const [planData, setPlanData] = useState({
    meetingPoints: {
      home: '',
      neighborhood: ''
    },
    emergencyContacts: [],
    goBagItems: [],
    evacuationRoutes: [],
    drillSchedule: {
      lastDrill: '',
      nextDrill: '',
      frequency: 'biannual'
    },
    specialNeeds: {
      elderly: [],
      children: [],
      disabilities: [],
      pets: []
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [newRoute, setNewRoute] = useState({ name: '', description: '', landmarks: '' });
  const [newElderly, setNewElderly] = useState({ name: '', needs: '', medications: '' });
  const [newChild, setNewChild] = useState({ name: '', age: '', allergies: '', school: '' });
  const [newPet, setNewPet] = useState({ name: '', type: '', needs: '', vet: '' });

  // Load saved data from localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem('emergencyPlan');
    if (savedPlan) {
      try {
        setPlanData(JSON.parse(savedPlan));
      } catch (error) {
        console.error('Error loading saved plan:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('emergencyPlan', JSON.stringify(planData));
  }, [planData]);

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      setPlanData(prev => ({
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, { ...newContact, id: Date.now() }]
      }));
      setNewContact({ name: '', phone: '', relationship: '' });
    }
  };

  const removeContact = (id) => {
    setPlanData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(contact => contact.id !== id)
    }));
  };

  const addRoute = () => {
    if (newRoute.name && newRoute.description) {
      setPlanData(prev => ({
        ...prev,
        evacuationRoutes: [...prev.evacuationRoutes, { ...newRoute, id: Date.now() }]
      }));
      setNewRoute({ name: '', description: '', landmarks: '' });
    }
  };

  const removeRoute = (id) => {
    setPlanData(prev => ({
      ...prev,
      evacuationRoutes: prev.evacuationRoutes.filter(route => route.id !== id)
    }));
  };

  const addElderly = () => {
    if (newElderly.name) {
      setPlanData(prev => ({
        ...prev,
        specialNeeds: {
          ...prev.specialNeeds,
          elderly: [...prev.specialNeeds.elderly, { ...newElderly, id: Date.now() }]
        }
      }));
      setNewElderly({ name: '', needs: '', medications: '' });
    }
  };

  const addChild = () => {
    if (newChild.name) {
      setPlanData(prev => ({
        ...prev,
        specialNeeds: {
          ...prev.specialNeeds,
          children: [...prev.specialNeeds.children, { ...newChild, id: Date.now() }]
        }
      }));
      setNewChild({ name: '', age: '', allergies: '', school: '' });
    }
  };

  const addPet = () => {
    if (newPet.name) {
      setPlanData(prev => ({
        ...prev,
        specialNeeds: {
          ...prev.specialNeeds,
          pets: [...prev.specialNeeds.pets, { ...newPet, id: Date.now() }]
        }
      }));
      setNewPet({ name: '', type: '', needs: '', vet: '' });
    }
  };

  const exportPlan = () => {
    const planText = `
EMERGENCY FAMILY PLAN
Generated: ${new Date().toLocaleDateString()}

MEETING POINTS:
- Home Area: ${planData.meetingPoints.home || 'Not specified'}
- Neighborhood: ${planData.meetingPoints.neighborhood || 'Not specified'}

EMERGENCY CONTACTS:
${planData.emergencyContacts.map(c => `- ${c.name} (${c.relationship}): ${c.phone}`).join('\n') || 'No contacts added'}

EVACUATION ROUTES:
${planData.evacuationRoutes.map(r => `- ${r.name}: ${r.description}`).join('\n') || 'No routes specified'}

DRILL SCHEDULE:
- Last Drill: ${planData.drillSchedule.lastDrill || 'Not scheduled'}
- Next Drill: ${planData.drillSchedule.nextDrill || 'Not scheduled'}
- Frequency: ${planData.drillSchedule.frequency}

SPECIAL NEEDS:
Elderly: ${planData.specialNeeds.elderly.length || 0} person(s)
Children: ${planData.specialNeeds.children.length || 0} child(ren)
Pets: ${planData.specialNeeds.pets.length || 0} pet(s)

GO-BAG ITEMS:
${planData.goBagItems.length || 0} items packed

---
Keep this plan in a safe, accessible location.
Review and update every 6 months.
`;

    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emergency-plan.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'meeting-points', label: 'Meeting Points', icon: Home },
    { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
    { id: 'go-bag', label: 'Go-Bag Checklist', icon: Briefcase },
    { id: 'routes', label: 'Evacuation Routes', icon: Car },
    { id: 'drills', label: 'Drill Schedule', icon: Calendar },
    { id: 'special-needs', label: 'Special Needs', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
      <Header title="Emergency Plan" subtitle="Family Safety" showBack icon={Shield} />

      <main className="px-4 pt-24 pb-24 max-w-md mx-auto">
        {/* Progress Overview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white">Family Emergency Plan</h2>
            <button
              onClick={exportPlan}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <p className="text-sm text-white/70 mb-3">Track your preparedness progress</p>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (
                  (planData.meetingPoints.home && planData.meetingPoints.neighborhood ? 16.67 : 0) +
                  (planData.emergencyContacts.length > 0 ? 16.67 : 0) +
                  (planData.goBagItems.length > 0 ? 16.67 : 0) +
                  (planData.evacuationRoutes.length > 0 ? 16.67 : 0) +
                  (planData.drillSchedule.nextDrill ? 16.67 : 0) +
                  ((planData.specialNeeds.elderly.length + planData.specialNeeds.children.length + planData.specialNeeds.pets.length) > 0 ? 16.65 : 0)
                ))}%`
              }}
            ></div>
          </div>
          <p className="text-xs text-white/60">Progress: {Math.round(
            (planData.meetingPoints.home && planData.meetingPoints.neighborhood ? 16.67 : 0) +
            (planData.emergencyContacts.length > 0 ? 16.67 : 0) +
            (planData.goBagItems.length > 0 ? 16.67 : 0) +
            (planData.evacuationRoutes.length > 0 ? 16.67 : 0) +
            (planData.drillSchedule.nextDrill ? 16.67 : 0) +
            ((planData.specialNeeds.elderly.length + planData.specialNeeds.children.length + planData.specialNeeds.pets.length) > 0 ? 16.65 : 0)
          )}% Complete</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-white text-blue-950 shadow-lg'
                  : 'bg-white/10 text-white/80 hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          {/* Meeting Points Tab */}
          {activeTab === 'meeting-points' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">Meeting Points</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Home Area Meeting Point</label>
                  <input
                    type="text"
                    value={planData.meetingPoints.home}
                    onChange={(e) => setPlanData(prev => ({
                      ...prev,
                      meetingPoints: { ...prev.meetingPoints, home: e.target.value }
                    }))}
                    placeholder="e.g., Front yard, mailbox, neighbor's house"
                    className="w-full p-3 bg-white/20 rounded-lg border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Neighborhood Meeting Point</label>
                  <input
                    type="text"
                    value={planData.meetingPoints.neighborhood}
                    onChange={(e) => setPlanData(prev => ({
                      ...prev,
                      meetingPoints: { ...prev.meetingPoints, neighborhood: e.target.value }
                    }))}
                    placeholder="e.g., Community center, park, school"
                    className="w-full p-3 bg-white/20 rounded-lg border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">Emergency Contacts</h3>

              {/* Add Contact Form */}
              <div className="space-y-2 p-3 bg-white/20 rounded-lg">
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contact name"
                  className="w-full p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                />
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                  className="w-full p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                />
                <input
                  type="text"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                  placeholder="Relationship (e.g., neighbor, relative)"
                  className="w-full p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                />
                <button
                  onClick={addContact}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </button>
              </div>

              {/* Contact List */}
              <div className="space-y-2">
                {planData.emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 bg-white/20 rounded-lg">
                    <div>
                      <div className="font-bold text-white">{contact.name}</div>
                      <div className="text-sm text-white/70">{contact.relationship} • {contact.phone}</div>
                    </div>
                    <button
                      onClick={() => removeContact(contact.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {planData.emergencyContacts.length === 0 && (
                  <p className="text-white/60 text-center py-4">No emergency contacts added yet</p>
                )}
              </div>
            </div>
          )}

          {/* Go-Bag Checklist Tab */}
          {activeTab === 'go-bag' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">Go-Bag Essentials</h3>
              <div className="space-y-2">
                {[
                  'Water (1 gallon per person)',
                  'Non-perishable food (3 days)',
                  'First aid kit',
                  'Flashlight + batteries',
                  'Whistle',
                  'Dust mask',
                  'Personal hygiene items',
                  'Copies of important documents',
                  'Cash (small bills)',
                  'Chargers + power bank',
                  'Medications (7 days supply)',
                  'Emergency blanket',
                  'Multi-tool',
                  'Local maps'
                ].map((item, index) => (
                  <label key={index} className="flex items-center gap-3 p-2 bg-white/20 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planData.goBagItems.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlanData(prev => ({
                            ...prev,
                            goBagItems: [...prev.goBagItems, item]
                          }));
                        } else {
                          setPlanData(prev => ({
                            ...prev,
                            goBagItems: prev.goBagItems.filter(i => i !== item)
                          }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                    />
                    <span className="text-white">{item}</span>
                  </label>
                ))}
              </div>
              <div className="text-center text-white/60 text-sm">
                {planData.goBagItems.length} of 14 items packed
              </div>
            </div>
          )}

          {/* Evacuation Routes Tab */}
          {activeTab === 'routes' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">Evacuation Routes</h3>

              {/* Add Route Form */}
              <div className="space-y-2 p-3 bg-white/20 rounded-lg">
                <input
                  type="text"
                  value={newRoute.name}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Route name (e.g., Main Street Route)"
                  className="w-full p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                />
                <input
                  type="text"
                  value={newRoute.description}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Route description"
                  className="w-full p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                />
                <input
                  type="text"
                  value={newRoute.landmarks}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, landmarks: e.target.value }))}
                  placeholder="Key landmarks (optional)"
                  className="w-full p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                />
                <button
                  onClick={addRoute}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Route
                </button>
              </div>

              {/* Route List */}
              <div className="space-y-2">
                {planData.evacuationRoutes.map((route) => (
                  <div key={route.id} className="p-3 bg-white/20 rounded-lg">
                    <div className="font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {route.name}
                    </div>
                    <p className="text-sm text-white/70 mt-1">{route.description}</p>
                    {route.landmarks && (
                      <p className="text-xs text-white/60 mt-1">Landmarks: {route.landmarks}</p>
                    )}
                    <button
                      onClick={() => removeRoute(route.id)}
                      className="mt-2 text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {planData.evacuationRoutes.length === 0 && (
                  <p className="text-white/60 text-center py-4">No evacuation routes added yet</p>
                )}
              </div>
            </div>
          )}

          {/* Drill Schedule Tab */}
          {activeTab === 'drills' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">Emergency Drills</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Last Drill Date</label>
                  <input
                    type="date"
                    value={planData.drillSchedule.lastDrill}
                    onChange={(e) => setPlanData(prev => ({
                      ...prev,
                      drillSchedule: { ...prev.drillSchedule, lastDrill: e.target.value }
                    }))}
                    className="w-full p-3 bg-white/20 rounded-lg border border-white/30 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Next Drill Date</label>
                  <input
                    type="date"
                    value={planData.drillSchedule.nextDrill}
                    onChange={(e) => setPlanData(prev => ({
                      ...prev,
                      drillSchedule: { ...prev.drillSchedule, nextDrill: e.target.value }
                    }))}
                    className="w-full p-3 bg-white/20 rounded-lg border border-white/30 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Drill Frequency</label>
                  <select
                    value={planData.drillSchedule.frequency}
                    onChange={(e) => setPlanData(prev => ({
                      ...prev,
                      drillSchedule: { ...prev.drillSchedule, frequency: e.target.value }
                    }))}
                    className="w-full p-3 bg-white/20 rounded-lg border border-white/30 text-white focus:outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biannual">Twice a Year</option>
                    <option value="annual">Once a Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Special Needs Tab */}
          {activeTab === 'special-needs' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">Special Needs</h3>

              {/* Elderly Section */}
              <div>
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Elderly Family Members
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newElderly.name}
                      onChange={(e) => setNewElderly(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Name"
                      className="p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                    />
                    <input
                      type="text"
                      value={newElderly.needs}
                      onChange={(e) => setNewElderly(prev => ({ ...prev, needs: e.target.value }))}
                      placeholder="Special needs"
                      className="p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                    />
                  </div>
                  <input
                    type="text"
                    value={newElderly.medications}
                    onChange={(e) => setNewElderly(prev => ({ ...prev, medications: e.target.value }))}
                    placeholder="Medications (if any)"
                    className="w-full p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                  />
                  <button
                    onClick={addElderly}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Elderly
                  </button>

                  <div className="space-y-2 mt-3">
                    {planData.specialNeeds.elderly.map((person) => (
                      <div key={person.id} className="p-3 bg-white/20 rounded-lg">
                        <div className="font-bold text-white">{person.name}</div>
                        <p className="text-sm text-white/70">Needs: {person.needs || 'None specified'}</p>
                        {person.medications && (
                          <p className="text-sm text-white/60">Medications: {person.medications}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Children Section */}
              <div>
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Children
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newChild.name}
                      onChange={(e) => setNewChild(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Name"
                      className="p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                    />
                    <input
                      type="number"
                      value={newChild.age}
                      onChange={(e) => setNewChild(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="Age"
                      className="p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                    />
                  </div>
                  <input
                    type="text"
                    value={newChild.allergies}
                    onChange={(e) => setNewChild(prev => ({ ...prev, allergies: e.target.value }))}
                    placeholder="Allergies (if any)"
                    className="w-full p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                  />
                  <input
                    type="text"
                    value={newChild.school}
                    onChange={(e) => setNewChild(prev => ({ ...prev, school: e.target.value }))}
                    placeholder="School/Daycare"
                    className="w-full p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                  />
                  <button
                    onClick={addChild}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Child
                  </button>

                  <div className="space-y-2 mt-3">
                    {planData.specialNeeds.children.map((child) => (
                      <div key={child.id} className="p-3 bg-white/20 rounded-lg">
                        <div className="font-bold text-white">{child.name} (Age: {child.age || 'N/A'})</div>
                        <p className="text-sm text-white/70">School: {child.school || 'Not specified'}</p>
                        {child.allergies && (
                          <p className="text-sm text-white/60">Allergies: {child.allergies}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pets Section */}
              <div>
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <PawPrint className="w-4 h-4" />
                  Pets
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newPet.name}
                      onChange={(e) => setNewPet(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Pet name"
                      className="p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                    />
                    <input
                      type="text"
                      value={newPet.type}
                      onChange={(e) => setNewPet(prev => ({ ...prev, type: e.target.value }))}
                      placeholder="Type (dog, cat, etc.)"
                      className="p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                    />
                  </div>
                  <input
                    type="text"
                    value={newPet.needs}
                    onChange={(e) => setNewPet(prev => ({ ...prev, needs: e.target.value }))}
                    placeholder="Special needs/medications"
                    className="w-full p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                  />
                  <input
                    type="text"
                    value={newPet.vet}
                    onChange={(e) => setNewPet(prev => ({ ...prev, vet: e.target.value }))}
                    placeholder="Veterinarian contact"
                    className="w-full p-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50"
                  />
                  <button
                    onClick={addPet}
                    className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Pet
                  </button>

                  <div className="space-y-2 mt-3">
                    {planData.specialNeeds.pets.map((pet) => (
                      <div key={pet.id} className="p-3 bg-white/20 rounded-lg">
                        <div className="font-bold text-white">{pet.name} ({pet.type})</div>
                        <p className="text-sm text-white/70">Needs: {pet.needs || 'None specified'}</p>
                        {pet.vet && (
                          <p className="text-sm text-white/60">Vet: {pet.vet}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default EmergencyPlan;
