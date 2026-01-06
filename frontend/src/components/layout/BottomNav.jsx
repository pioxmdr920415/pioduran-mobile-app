import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Camera } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { path: '/geotag-camera', icon: Camera, label: 'Camera' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] border-t-2 border-white">
      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative flex justify-around items-center py-1 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center py-1.5 px-5 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-yellow-500 shadow-lg scale-105' 
                  : 'hover:bg-white/10'
              }`}
            >
              <Icon 
                className={`w-6 h-6 ${
                  isActive ? 'text-blue-950' : 'text-white'
                }`} 
              />
              <span 
                className={`text-xs mt-0.5 font-medium ${
                  isActive ? 'text-blue-950' : 'text-white/80'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;