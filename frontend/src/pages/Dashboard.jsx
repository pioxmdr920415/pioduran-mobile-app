import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Phone,
  AlertTriangle,
  CloudRain,
  Map,
  BookOpen,
  HeartHandshake,
  Shield
} from 'lucide-react';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'ai-assistant',
      icon: Bot,
      title: 'AI Emergency Assistant',
      subtitle: 'Smart emergency help',
      color: 'from-purple-500 to-purple-700',
      disabled: false,
      onClick: () => navigate('/ai-emergency-assistant')
    },
    {
      id: 'emergency-hotline',
      icon: Phone,
      title: 'Emergency Hotline',
      subtitle: 'Quick access to numbers',
      color: 'from-red-500 to-red-700',
      onClick: () => navigate('/emergency-hotline')
    },
    {
      id: 'report-incident',
      icon: AlertTriangle,
      title: 'Report an Incident',
      subtitle: 'Submit incident reports',
      color: 'from-yellow-500 to-orange-500',
      onClick: () => navigate('/report-incident')
    },
    {
      id: 'typhoon-dashboard',
      icon: CloudRain,
      title: 'Typhoon Dashboard',
      subtitle: 'Live monitoring',
      color: 'from-cyan-500 to-blue-600',
      onClick: () => navigate('/typhoon-dashboard')
    },
    {
      id: 'pio-duran-map',
      icon: Map,
      title: 'Pio Duran Map',
      subtitle: 'Evacuation centers',
      color: 'from-green-500 to-emerald-600',
      onClick: () => navigate('/map')
    },
    {
      id: 'disaster-preparedness',
      icon: BookOpen,
      title: 'Disaster Preparedness',
      subtitle: 'Guidelines & tips',
      color: 'from-blue-500 to-indigo-600',
      onClick: () => navigate('/disaster-guidelines')
    },
    {
      id: 'support-resources',
      icon: HeartHandshake,
      title: 'Support Resources',
      subtitle: 'Help & information',
      color: 'from-pink-500 to-rose-600',
      onClick: () => navigate('/support-resources')
    },
    {
      id: 'emergency-plan',
      icon: Shield,
      title: 'Emergency Plan',
      subtitle: 'Family safety plans',
      color: 'from-amber-500 to-orange-600',
      onClick: () => navigate('/emergency-plan')
    }
  ];

  const aiAssistantItem = menuItems.find(item => item.id === 'ai-assistant');
  const emergencyHotlineItem = menuItems.find(item => item.id === 'emergency-hotline');
  const otherItems = menuItems.filter(item => item.id !== 'ai-assistant' && item.id !== 'emergency-hotline');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
      <Header title="Dashboard" subtitle="Quick Access Menu" />

      <main className="px-6 pt-24 pb-28">
        {/* Full width buttons for AI Assistant and Emergency Hotline */}
        <div className="space-y-4 mb-6">
          {aiAssistantItem && (
            <button
              onClick={aiAssistantItem.onClick}
              disabled={aiAssistantItem.disabled}
              className={`w-full relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br ${aiAssistantItem.color} shadow-lg border border-white/20 transition-all duration-200 ${
                aiAssistantItem.disabled
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              <div className="flex-shrink-0 p-2.5 bg-white/20 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <h3 className="text-base font-bold text-white leading-tight truncate mb-0.5">
                  {aiAssistantItem.title}
                </h3>
                <p className="text-xs text-white/70 leading-tight">
                  {aiAssistantItem.subtitle}
                </p>
              </div>
            </button>
          )}

          {emergencyHotlineItem && (
            <button
              onClick={emergencyHotlineItem.onClick}
              className={`w-full relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br ${emergencyHotlineItem.color} shadow-lg border border-white/20 transition-all duration-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]`}
            >
              <div className="flex-shrink-0 p-2.5 bg-white/20 rounded-lg">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <h3 className="text-base font-bold text-white leading-tight truncate mb-0.5">
                  {emergencyHotlineItem.title}
                </h3>
                <p className="text-xs text-white/70 leading-tight">
                  {emergencyHotlineItem.subtitle}
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Other menu items in grid */}
        <div className="grid grid-cols-2 gap-4">
          {otherItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                disabled={item.disabled}
                className={`relative flex flex-col items-center justify-center p-5 rounded-xl bg-gradient-to-br ${item.color} shadow-lg border border-white/20 transition-all duration-300 ${
                  item.disabled
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                } min-h-[120px]`}
              >
                <div className="flex-shrink-0 p-2.5 bg-white/20 rounded-lg mb-3">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-bold text-white leading-tight mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/70 leading-tight">
                    {item.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;