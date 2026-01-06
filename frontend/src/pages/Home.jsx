import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, AlertTriangle } from 'lucide-react';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import WeatherWidget from '../components/weather/WeatherWidget';
import { getTimeBasedBackground } from '../utils/helpers';

const Home = () => {
  const navigate = useNavigate();
  const [bgImage, setBgImage] = useState(getTimeBasedBackground());

  useEffect(() => {
    // Update background every minute
    const interval = setInterval(() => {
      setBgImage(getTimeBasedBackground());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col mt-16">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/30" />
      </div>

      <Header subtitle="Emergency Preparedness" />

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col px-6 pt-6 pb-28 overflow-auto">
        {/* Weather Widget */}
        <div className="mb-8">
          <WeatherWidget lat={13.0293} lon={123.445} />
        </div>

        {/* Slogan Section */}
        <div className="mb-8 animate-fade-in text-center">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-1">
            Resilient Pio Duran:
          </h2>
          <h3 className="text-3xl font-bold text-yellow-500 drop-shadow-lg mb-3">
            Prepared for Tomorrow
          </h3>
          <p className="text-sm text-white/90 drop-shadow-lg leading-relaxed px-2">
            Enhancing disaster preparedness, strengthening community resilience and ensuring safety for all
          </p>
        </div>



        {/* CTA Buttons */}
        <div className="space-y-4">
  {/* Emergency Hotline Button */}
  <button
    onClick={() => navigate('/emergency-hotline')}
    className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
  >
    <div className="p-3 bg-white/20 rounded-lg">
      <Phone className="w-6 h-6 text-white" />
    </div>
    <div className="text-left flex-1">
      <h4 className="text-base font-bold text-white mb-0.5">Emergency Hotline</h4>
      <p className="text-xs text-white/80">Quick access to emergency numbers</p>
    </div>
  </button>

  {/* Report an Incident Button */}
  <button
    onClick={() => navigate('/report-incident')}
    className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
  >
    <div className="p-3 bg-white/20 rounded-lg">
      <AlertTriangle className="w-6 h-6 text-white" />
    </div>
    <div className="text-left flex-1">
      <h4 className="text-base font-bold text-white mb-0.5">Report an Incident</h4>
      <p className="text-xs text-white/80">Submit detailed incident reports</p>
    </div>
  </button>
</div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;