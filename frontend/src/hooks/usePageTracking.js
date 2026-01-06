import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsService from '../services/analyticsService';

export const usePageTracking = (userId = null) => {
  const location = useLocation();

  useEffect(() => {
    // Track page view
    const pageName = location.pathname.replace('/', '') || 'home';
    analyticsService.trackPageView(pageName, userId);
  }, [location, userId]);
};

export default usePageTracking;
