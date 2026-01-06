import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

class AnalyticsService {
  async trackEvent(eventType, eventData = {}, userId = null) {
    try {
      await axios.post(`${API_URL}/api/analytics/track`, {
        event_type: eventType,
        event_data: eventData,
        user_id: userId
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async getDashboardAnalytics(days = 7) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/api/analytics/dashboard`, {
        params: { days },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard analytics:', error);
      throw error;
    }
  }

  async getIncidentAnalytics(days = 30) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/api/analytics/incidents`, {
        params: { days },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch incident analytics:', error);
      throw error;
    }
  }

  async getUserAnalytics(days = 30) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/api/analytics/users`, {
        params: { days },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
      throw error;
    }
  }

  async getSystemAnalytics() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/api/analytics/system`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system analytics:', error);
      throw error;
    }
  }

  async getRealtimeMetrics() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/api/analytics/realtime`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch realtime metrics:', error);
      throw error;
    }
  }

  async exportAnalytics(days = 30) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/api/analytics/export`, {
        params: { days, format: 'json' },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export analytics:', error);
      throw error;
    }
  }

  // Helper methods for tracking common events
  trackPageView(pageName, userId = null) {
    this.trackEvent('page_view', { page: pageName }, userId);
  }

  trackIncidentReport(incidentId, userId = null) {
    this.trackEvent('incident_report', { incident_id: incidentId }, userId);
  }

  trackLogin(userId) {
    this.trackEvent('login', {}, userId);
  }

  trackLogout(userId) {
    this.trackEvent('logout', {}, userId);
  }
}

export default new AnalyticsService();
