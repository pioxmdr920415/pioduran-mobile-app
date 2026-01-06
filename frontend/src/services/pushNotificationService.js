import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

class PushNotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
  }

  async getVapidPublicKey() {
    try {
      const response = await axios.get(`${API_URL}/api/notifications/vapid-public-key`);
      return response.data.publicKey;
    } catch (error) {
      console.error('Failed to get VAPID key:', error);
      throw error;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribe(userId = null) {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers are not supported');
      }

      // Check if push messaging is supported
      if (!('PushManager' in window)) {
        throw new Error('Push messaging is not supported');
      }

      // Request notification permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Notification permission denied');
      }

      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;

      // Get VAPID public key
      const vapidPublicKey = await this.getVapidPublicKey();
      const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      // Send subscription to backend
      await axios.post(`${API_URL}/api/notifications/subscribe`, {
        subscription: this.subscription.toJSON(),
        user_id: userId,
        preferences: {
          incidents: true,
          typhoons: true,
          emergency_broadcasts: true,
          system_updates: true
        }
      });

      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async unsubscribe() {
    try {
      if (!this.subscription) {
        const registration = await navigator.serviceWorker.ready;
        this.subscription = await registration.pushManager.getSubscription();
      }

      if (this.subscription) {
        const endpoint = this.subscription.endpoint;
        await this.subscription.unsubscribe();
        
        // Notify backend
        await axios.post(`${API_URL}/api/notifications/unsubscribe`, null, {
          params: { endpoint }
        });
      }

      this.subscription = null;
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  async getSubscriptionStatus() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      return false;
    }
  }

  async getPreferences(userId) {
    try {
      const response = await axios.get(`${API_URL}/api/notifications/preferences/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      throw error;
    }
  }

  async updatePreferences(userId, preferences) {
    try {
      await axios.put(`${API_URL}/api/notifications/preferences`, {
        user_id: userId,
        ...preferences
      });
      return true;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  async sendNotification(title, body, notificationType = 'general', data = {}) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${API_URL}/api/notifications/send`,
        {
          title,
          body,
          notification_type: notificationType,
          data
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }
}

export default new PushNotificationService();
