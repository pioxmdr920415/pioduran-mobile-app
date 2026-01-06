/**
 * Offline Sync Service
 * Manages synchronization of offline data when connection is restored
 */

import offlineStorage from '@/utils/offlineStorage';
import { incidentAPI } from './api';

class OfflineSync {
  constructor() {
    this.syncing = false;
    this.syncQueue = [];
    this.listeners = [];
    
    // Listen for online events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.syncAll());
      
      // Also sync on service worker message
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'SYNC_INCIDENTS') {
            this.syncAll();
          }
        });
      }
    }
  }

  /**
   * Add a sync listener
   */
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback({ event, data });
      } catch (error) {
        console.error('Sync listener error:', error);
      }
    });
  }

  /**
   * Queue an item for sync
   */
  async queueForSync(type, data) {
    const item = {
      id: Date.now() + Math.random(),
      type,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
      maxRetries: 3
    };

    this.syncQueue.push(item);
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.syncAll();
    }

    return item.id;
  }

  /**
   * Sync all pending data
   */
  async syncAll() {
    if (this.syncing) {
      console.log('Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('Cannot sync while offline');
      return;
    }

    this.syncing = true;
    this.notifyListeners('sync-start', { timestamp: new Date().toISOString() });

    try {
      // Sync pending incidents
      await this.syncPendingIncidents();
      
      // Sync queue items
      await this.syncQueueItems();
      
      this.notifyListeners('sync-complete', { 
        success: true,
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Sync error:', error);
      this.notifyListeners('sync-error', { 
        error: error.message,
        timestamp: new Date().toISOString() 
      });
    } finally {
      this.syncing = false;
    }
  }

  /**
   * Sync pending incidents from IndexedDB
   */
  async syncPendingIncidents() {
    try {
      const pendingIncidents = await offlineStorage.getPendingIncidents();
      console.log(`Found ${pendingIncidents.length} pending incidents to sync`);

      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const incident of pendingIncidents) {
        try {
          // Submit incident to API
          const response = await incidentAPI.create(incident.data || incident);
          
          // Mark as synced
          await offlineStorage.markIncidentAsSynced(incident.id);
          results.success++;
          
          console.log('Synced incident:', response);
        } catch (error) {
          console.error('Failed to sync incident:', error);
          results.failed++;
          results.errors.push({
            incidentId: incident.id,
            error: error.message
          });
        }
      }

      // Clean up synced incidents
      if (results.success > 0) {
        await offlineStorage.clearSyncedIncidents();
      }

      this.notifyListeners('incidents-synced', results);
      return results;
    } catch (error) {
      console.error('Error syncing pending incidents:', error);
      throw error;
    }
  }

  /**
   * Sync items from queue
   */
  async syncQueueItems() {
    const itemsToSync = [...this.syncQueue];
    
    for (const item of itemsToSync) {
      try {
        await this.syncItem(item);
        
        // Remove from queue on success
        this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
      } catch (error) {
        console.error('Failed to sync queue item:', error);
        
        // Increment retry count
        item.retries++;
        
        // Remove if max retries exceeded
        if (item.retries >= item.maxRetries) {
          console.error('Max retries exceeded for item:', item);
          this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
          
          this.notifyListeners('sync-item-failed', {
            item,
            error: error.message
          });
        }
      }
    }
  }

  /**
   * Sync a single item based on type
   */
  async syncItem(item) {
    switch (item.type) {
      case 'incident':
        return await incidentAPI.create(item.data);
      
      case 'update':
        return await incidentAPI.update(item.data.id, item.data);
      
      default:
        console.warn('Unknown sync item type:', item.type);
        return null;
    }
  }

  /**
   * Save incident for offline submission
   */
  async saveIncidentOffline(incidentData) {
    try {
      const id = await offlineStorage.addPendingIncident(incidentData);
      
      this.notifyListeners('incident-saved-offline', {
        id,
        data: incidentData
      });
      
      // Register background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-incidents');
        console.log('Background sync registered');
      }
      
      return id;
    } catch (error) {
      console.error('Failed to save incident offline:', error);
      throw error;
    }
  }

  /**
   * Get pending incidents count
   */
  async getPendingCount() {
    try {
      const pending = await offlineStorage.getPendingIncidents();
      return pending.length + this.syncQueue.length;
    } catch (error) {
      console.error('Failed to get pending count:', error);
      return 0;
    }
  }

  /**
   * Force sync now
   */
  async forceSyncNow() {
    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline');
    }
    
    return await this.syncAll();
  }
}

// Export singleton instance
const offlineSync = new OfflineSync();
export default offlineSync;
