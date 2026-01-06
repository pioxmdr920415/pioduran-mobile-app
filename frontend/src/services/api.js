import axios from 'axios';

// API base URL - Use environment variable for backend URL with /api prefix
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Incident report endpoints
export const incidentAPI = {
  create: async (reportData) => {
    try {
      const response = await api.post('/incidents/', reportData);
      return response.data;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  },

  getAll: async (filters = {}) => {
    try {
      console.log('Calling GET /incidents/ with filters:', filters);
      const response = await api.get('/incidents/', { params: filters });
      console.log('Response:', response.status, response.data?.length, 'incidents');
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents:', error.response || error);
      throw error;
    }
  },

  getById: async (reportId) => {
    try {
      const response = await api.get(`/incidents/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching incident:', error);
      throw error;
    }
  },

  update: async (reportId, updateData) => {
    try {
      const response = await api.put(`/incidents/${reportId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
    }
  },

  delete: async (reportId) => {
    try {
      const response = await api.delete(`/incidents/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting incident:', error);
      throw error;
    }
  },

  getUserReports: async (userId) => {
    try {
      const response = await api.get(`/incidents/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user reports:', error);
      throw error;
    }
  },
};

// Status check endpoints
export const statusAPI = {
  create: async (statusData) => {
    const response = await api.post('/status', statusData);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/status');
    return response.data;
  },
};

// Weather API endpoints
export const weatherAPI = {
  getCurrentWeather: async (lat, lon) => {
    const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
    if (!API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    return response.data;
  },

  getWeatherForecast: async (lat, lon) => {
    const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
    if (!API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    return response.data;
  },
};

// Typhoon API endpoints
export const typhoonAPI = {
  // Create a new typhoon (Admin only)
  create: async (typhoonData) => {
    const response = await api.post('/typhoons/', typhoonData);
    return response.data;
  },

  // Get all typhoons with optional status filter
  getAll: async (filters = {}) => {
    const response = await api.get('/typhoons/', { params: filters });
    return response.data;
  },

  // Get all active typhoons
  getActive: async () => {
    const response = await api.get('/typhoons/active');
    return response.data;
  },

  // Get typhoon by ID
  getById: async (typhoonId) => {
    const response = await api.get(`/typhoons/${typhoonId}`);
    return response.data;
  },

  // Update typhoon (Admin only)
  update: async (typhoonId, updateData) => {
    const response = await api.put(`/typhoons/${typhoonId}`, updateData);
    return response.data;
  },

  // Archive typhoon - change status to inactive (Admin only)
  archive: async (typhoonId) => {
    const response = await api.put(`/typhoons/${typhoonId}/archive`);
    return response.data;
  },

  // Add tracking point to typhoon (Admin only)
  addTrackingPoint: async (typhoonId, trackingPoint) => {
    const response = await api.post(`/typhoons/${typhoonId}/tracking`, trackingPoint);
    return response.data;
  },

  // Delete typhoon (Admin only)
  delete: async (typhoonId) => {
    const response = await api.delete(`/typhoons/${typhoonId}`);
    return response.data;
  },
};

export default api;