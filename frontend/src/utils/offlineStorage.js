/**
 * IndexedDB utility for offline data storage
 * Stores incident reports when offline and syncs when connection is restored
 */

const DB_NAME = 'EmergencyResponseDB';
const DB_VERSION = 1;
const STORES = {
  PENDING_INCIDENTS: 'pendingIncidents',
  CACHED_DATA: 'cachedData'
};

class OfflineStorage {
  constructor() {
    this.db = null;
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create pending incidents store
        if (!db.objectStoreNames.contains(STORES.PENDING_INCIDENTS)) {
          const incidentStore = db.createObjectStore(STORES.PENDING_INCIDENTS, {
            keyPath: 'id',
            autoIncrement: true
          });
          incidentStore.createIndex('timestamp', 'timestamp', { unique: false });
          incidentStore.createIndex('synced', 'synced', { unique: false });
        }

        // Create cached data store
        if (!db.objectStoreNames.contains(STORES.CACHED_DATA)) {
          const cacheStore = db.createObjectStore(STORES.CACHED_DATA, {
            keyPath: 'key'
          });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }

  async addPendingIncident(incidentData) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_INCIDENTS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_INCIDENTS);
      
      const data = {
        ...incidentData,
        timestamp: new Date().toISOString(),
        synced: false
      };

      const request = store.add(data);

      request.onsuccess = () => {
        console.log('Incident saved offline:', request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to save incident offline:', request.error);
        reject(request.error);
      };
    });
  }

  async getPendingIncidents() {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_INCIDENTS], 'readonly');
      const store = transaction.objectStore(STORES.PENDING_INCIDENTS);
      const index = store.index('synced');
      
      const request = index.getAll(false);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async markIncidentAsSynced(id) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_INCIDENTS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_INCIDENTS);
      
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          data.syncedAt = new Date().toISOString();
          
          const updateRequest = store.put(data);
          
          updateRequest.onsuccess = () => {
            resolve(updateRequest.result);
          };
          
          updateRequest.onerror = () => {
            reject(updateRequest.error);
          };
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  async cacheData(key, data, expiryMinutes = 60) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.CACHED_DATA], 'readwrite');
      const store = transaction.objectStore(STORES.CACHED_DATA);
      
      const cacheData = {
        key,
        data,
        timestamp: new Date().toISOString(),
        expiry: new Date(Date.now() + expiryMinutes * 60000).toISOString()
      };

      const request = store.put(cacheData);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getCachedData(key) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.CACHED_DATA], 'readonly');
      const store = transaction.objectStore(STORES.CACHED_DATA);
      
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Check if expired
        const expiry = new Date(result.expiry);
        if (expiry < new Date()) {
          // Expired, delete it
          this.deleteCachedData(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteCachedData(key) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.CACHED_DATA], 'readwrite');
      const store = transaction.objectStore(STORES.CACHED_DATA);
      
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clearSyncedIncidents() {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_INCIDENTS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_INCIDENTS);
      const index = store.index('synced');
      
      const request = index.openCursor(true);
      let deleted = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          console.log(`Cleared ${deleted} synced incidents`);
          resolve(deleted);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

// Export singleton instance
const offlineStorage = new OfflineStorage();
export default offlineStorage;
