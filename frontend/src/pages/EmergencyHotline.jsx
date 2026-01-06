import React from 'react';
import { Phone, ExternalLink } from 'lucide-react';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import { emergencyHotlines } from '../utils/helpers';

const EmergencyHotline = () => {
  const handleCall = (number) => {
    window.location.href = `tel:${number.replace(/[^0-9+]/g, '')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
      <Header 
        title="Emergency Hotline" 
        subtitle="Quick Access Numbers" 
        showBack 
        icon={Phone}
      />

      <main className="px-6 pt-6 pb-28">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-white text-center leading-relaxed">
            <span className="font-bold">Emergency?</span> Tap any number below to call directly
          </p>
        </div>

        <div className="space-y-4">
          {emergencyHotlines.map((hotline, index) => (
            <button
              key={index}
              onClick={() => handleCall(hotline.number)}
              className="w-full flex items-center gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-300 active:scale-[0.98] shadow-lg"
            >
              <div className="p-3 bg-red-500/30 rounded-xl">
                <img src={hotline.logo} alt={`${hotline.name} logo`} className="w-7 h-7 object-cover rounded" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-base font-bold text-white mb-1">{hotline.name}</h3>
                <p className="text-xs text-white/60 mb-1.5">{hotline.description}</p>
                <p className="text-sm font-semibold text-yellow-500">{hotline.number}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-white/40" />
            </button>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default EmergencyHotline;