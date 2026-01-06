/**
 * Cache Manager for PWA
 * Manages cache storage and strategies
 */

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  STATIC: `emergency-static-${CACHE_VERSION}`,
  DYNAMIC: `emergency-dynamic-${CACHE_VERSION}`,
  IMAGES: `emergency-images-${CACHE_VERSION}`,
  API: `emergency-api-${CACHE_VERSION}`
};

const CACHE_EXPIRY = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  DYNAMIC: 24 * 60 * 60 * 1000, // 1 day
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
  API: 5 * 60 * 1000 // 5 minutes
};

class CacheManager {
  /**
   * Cache a resource
   */
  async cacheResource(cacheName, url, response) {
    try {
      const cache = await caches.open(cacheName);
      await cache.put(url, response.clone());
      return true;
    } catch (error) {
      console.error('Failed to cache resource:', error);
      return false;
    }
  }

  /**
   * Get cached resource
   */
  async getCachedResource(cacheName, url) {
    try {
      const cache = await caches.open(cacheName);
      const response = await cache.match(url);
      
      if (!response) {
        return null;
      }

      // Check if expired
      const cachedDate = new Date(response.headers.get('date'));
      const now = new Date();
      const age = now - cachedDate;
      
      const maxAge = CACHE_EXPIRY[cacheName.split('-')[1]?.toUpperCase()] || CACHE_EXPIRY.DYNAMIC;
      
      if (age > maxAge) {
        await cache.delete(url);
        return null;
      }

      return response;
    } catch (error) {
      console.error('Failed to get cached resource:', error);
      return null;
    }
  }

  /**
   * Clear old caches
   */
  async clearOldCaches() {
    try {
      const cacheNames = await caches.keys();
      const currentCaches = Object.values(CACHE_NAMES);
      
      const deletePromises = cacheNames
        .filter(name => !currentCaches.includes(name))
        .map(name => caches.delete(name));
      
      await Promise.all(deletePromises);
      console.log('Old caches cleared');
    } catch (error) {
      console.error('Failed to clear old caches:', error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize() {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2)
      };
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return null;
    }
  }

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('All caches cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear all caches:', error);
      return false;
    }
  }

  /**
   * Precache resources
   */
  async precacheResources(urls) {
    try {
      const cache = await caches.open(CACHE_NAMES.STATIC);
      await cache.addAll(urls);
      console.log('Resources precached:', urls.length);
      return true;
    } catch (error) {
      console.error('Failed to precache resources:', error);
      return false;
    }
  }
}

const cacheManager = new CacheManager();
export default cacheManager;
export { CACHE_NAMES, CACHE_EXPIRY };
