import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, X, Settings, Info, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Header = ({ title, subtitle, showBack = false, icon: Icon }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Show hamburger button only on homepage
  const showHamburger = location.pathname === '/' || location.pathname === '/home';

  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  // Handle escape key and focus management
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !menuButtonRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('click', handleClickOutside);
      // Focus first menu item
      const firstMenuItem = menuRef.current?.querySelector('button');
      firstMenuItem?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 shadow-lg border-b-2 border-white">
        {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative flex justify-between items-center py-3 px-5 max-w-md mx-auto">
        <div className="flex items-center gap-4">
          <img
            src="/images/logo.webp"
            alt="MDRRMO Logo"
            className="w-12 h-12 rounded-xl border-2 border-yellow-500 shadow-lg"
          />
          
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              {Icon && <Icon className="w-5 h-5 text-yellow-500" />}
              {title || 'MDRRMO PIO DURAN'}
            </h1>
            {subtitle && (
              <p className="text-xs text-yellow-500 font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          {/* Back Button */}
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          )}
          
          {/* Hamburger Menu Button */}
          {showHamburger && (
            <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Compact Navigation Menu - Login Hidden */}
            {isMenuOpen && (
              <nav
                ref={menuRef}
                className="absolute top-full right-0 mt-3 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 animate-in slide-in-from-top-2 duration-200"
                role="navigation"
                aria-label="Main navigation"
              >
                <div className="px-4 py-2 border-b border-gray-100 mb-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Navigation</p>
                </div>

                <button
                  onClick={() => handleNavigation('/settings')}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Settings className="w-5 h-5 text-gray-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700">Settings</span>
                </button>

                <button
                  onClick={() => handleNavigation('/help')}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <HelpCircle className="w-5 h-5 text-gray-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700">Help</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAboutOpen(true);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Info className="w-5 h-5 text-gray-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700">About</span>
                </button>
              </nav>
            )}
            </div>
          )}
        </div>
      </div>

      {/* About Modal */}
      <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">About</DialogTitle>
            <DialogDescription className="text-base leading-relaxed pt-3">
              This app is designed to assist in disaster management and emergency response.
              It provides tools for incident reporting, emergency contacts, maps, and real-time alerts
              to help communities prepare and respond to disasters effectively.
              <br /><br />
              <strong className="text-blue-900">MDRRMO Pio Duran, Albay</strong>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
    </>
  );
};

export default Header;