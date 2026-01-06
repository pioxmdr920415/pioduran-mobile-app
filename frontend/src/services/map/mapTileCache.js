/**
 * Map Tile Cache Service
 * Manages downloading, caching, and serving of map tiles for offline use
 */

class MapTileCache {
  constructor() {
    this.DB_NAME = 'MapTilesDB';
    this.DB_VERSION = 1;
    this.STORE_NAME = 'tiles';
    this.db = null;
    this.downloadQueue = [];
    this.downloading = false;
    this.listeners = [];
    this.abortController = null;
  }

  /**
   * Initialize IndexedDB for map tiles
   */
  async initDB() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open MapTilesDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('MapTilesDB initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('area', 'area', { unique: false });
          console.log('MapTiles store created');
        }
      };
    });
  }

  /**
   * Generate tile key from coordinates
   */
  getTileKey(z, x, y) {
    return `tile_${z}_${x}_${y}`;
  }

  /**
   * Get tile URL
   */
  getTileUrl(z, x, y, server = 'a') {
    return `https://${server}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }

  /**
   * Cache a single tile
   */
  async cacheTile(z, x, y, areaId = 'default') {
    await this.initDB();

    const key = this.getTileKey(z, x, y);
    const url = this.getTileUrl(z, x, y);

    try {
      // Check if already cached
      const existing = await this.getTile(z, x, y);
      if (existing) {
        return { success: true, cached: true };
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const tileData = {
        key,
        z,
        x,
        y,
        data: arrayBuffer,
        timestamp: Date.now(),
        area: areaId,
        size: arrayBuffer.byteLength
      };

      await new Promise((resolve, reject) => {
        const request = store.put(tileData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return { success: true, cached: false, size: arrayBuffer.byteLength };
    } catch (error) {
      console.error(`Failed to cache tile ${z}/${x}/${y}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get cached tile
   */
  async getTile(z, x, y) {
    await this.initDB();

    const key = this.getTileKey(z, x, y);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({
            blob: new Blob([result.data], { type: 'image/png' }),
            timestamp: result.timestamp
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Calculate tiles needed for a bounding box
   */
  getTilesInBounds(bounds, minZoom, maxZoom) {
    const tiles = [];

    for (let z = minZoom; z <= maxZoom; z++) {
      const nwTile = this.latLngToTile(bounds.north, bounds.west, z);
      const seTile = this.latLngToTile(bounds.south, bounds.east, z);

      for (let x = nwTile.x; x <= seTile.x; x++) {
        for (let y = nwTile.y; y <= seTile.y; y++) {
          tiles.push({ z, x, y });
        }
      }
    }

    return tiles;
  }

  /**
   * Convert lat/lng to tile coordinates
   */
  latLngToTile(lat, lng, zoom) {
    const n = Math.pow(2, zoom);
    const x = Math.floor((lng + 180) / 360 * n);
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
    return { x, y };
  }

  /**
   * Download tiles for an area
   */
  async downloadArea(bounds, minZoom, maxZoom, areaId = 'default', onProgress = null) {
    if (this.downloading) {
      throw new Error('Download already in progress');
    }

    this.downloading = true;
    this.abortController = new AbortController();

    try {
      const tiles = this.getTilesInBounds(bounds, minZoom, maxZoom);
      const totalTiles = tiles.length;
      let downloadedTiles = 0;
      let cachedTiles = 0;
      let failedTiles = 0;
      let totalSize = 0;

      this.notifyListeners('download-start', {
        totalTiles,
        bounds,
        minZoom,
        maxZoom
      });

      // Download in batches to avoid overwhelming the browser
      const batchSize = 10;
      for (let i = 0; i < tiles.length; i += batchSize) {
        if (this.abortController.signal.aborted) {
          throw new Error('Download cancelled');
        }

        const batch = tiles.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(({ z, x, y }) => this.cacheTile(z, x, y, areaId))
        );

        results.forEach(result => {
          if (result.success) {
            if (result.cached) {
              cachedTiles++;
            } else {
              downloadedTiles++;
              totalSize += result.size || 0;
            }
          } else {
            failedTiles++;
          }
        });

        const progress = ((i + batch.length) / totalTiles) * 100;
        
        this.notifyListeners('download-progress', {
          progress: Math.min(progress, 100),
          downloadedTiles,
          cachedTiles,
          failedTiles,
          totalTiles,
          totalSize
        });

        if (onProgress) {
          onProgress({
            progress: Math.min(progress, 100),
            downloadedTiles,
            cachedTiles,
            failedTiles,
            totalTiles
          });
        }

        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.downloading = false;
      this.abortController = null;

      const summary = {
        totalTiles,
        downloadedTiles,
        cachedTiles,
        failedTiles,
        totalSize,
        success: true
      };

      this.notifyListeners('download-complete', summary);

      return summary;
    } catch (error) {
      this.downloading = false;
      this.abortController = null;

      this.notifyListeners('download-error', {
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Cancel ongoing download
   */
  cancelDownload() {
    if (this.abortController) {
      this.abortController.abort();
      this.downloading = false;
      this.abortController = null;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const tiles = request.result;
        const totalTiles = tiles.length;
        const totalSize = tiles.reduce((sum, tile) => sum + (tile.size || 0), 0);
        const areas = [...new Set(tiles.map(t => t.area))];

        resolve({
          totalTiles,
          totalSize,
          totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
          areas: areas.length,
          areaList: areas
        });
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cached tiles
   */
  async clearCache(areaId = null) {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      if (areaId) {
        // Clear specific area
        const index = store.index('area');
        const request = index.openCursor(IDBKeyRange.only(areaId));
        let deleted = 0;

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            deleted++;
            cursor.continue();
          } else {
            console.log(`Cleared ${deleted} tiles from area ${areaId}`);
            resolve(deleted);
          }
        };

        request.onerror = () => reject(request.error);
      } else {
        // Clear all tiles
        const request = store.clear();

        request.onsuccess = () => {
          console.log('All map tiles cleared');
          resolve();
        };

        request.onerror = () => reject(request.error);
      }
    });
  }

  /**
   * Add event listener
   */
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback({ event, data });
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }
}

const mapTileCache = new MapTileCache();
export default mapTileCache;
