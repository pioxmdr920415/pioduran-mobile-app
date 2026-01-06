import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import mapTileCache from '@/services/map/mapTileCache';

/**
 * Offline-capable Tile Layer for Leaflet
 * Tries to load tiles from cache first, falls back to network
 */
const OfflineTileLayer = ({ url, attribution, ...options }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    // Create custom tile layer that checks cache first
    const OfflineTileLayerClass = L.TileLayer.extend({
      createTile: function (coords, done) {
        const tile = document.createElement('img');
        const { z, x, y } = coords;

        // Try to get tile from cache first
        mapTileCache
          .getTile(z, x, y)
          .then((cachedTile) => {
            if (cachedTile) {
              // Load from cache
              const url = URL.createObjectURL(cachedTile.blob);
              tile.src = url;
              tile.onload = () => {
                URL.revokeObjectURL(url);
                done(null, tile);
              };
              tile.onerror = () => {
                URL.revokeObjectURL(url);
                // If cached tile fails, try network
                this._loadTileFromNetwork(tile, z, x, y, done);
              };
            } else {
              // Load from network
              this._loadTileFromNetwork(tile, z, x, y, done);
            }
          })
          .catch(() => {
            // If cache check fails, load from network
            this._loadTileFromNetwork(tile, z, x, y, done);
          });

        return tile;
      },

      _loadTileFromNetwork: function (tile, z, x, y, done) {
        const tileUrl = this.getTileUrl({ z, x, y });
        tile.src = tileUrl;
        tile.onload = () => done(null, tile);
        tile.onerror = () => {
          // Show placeholder for failed tiles
          tile.src = this._getPlaceholderTile();
          done(null, tile);
        };
      },

      _getPlaceholderTile: function () {
        // Return a simple gray placeholder as data URL
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Tile Unavailable', 128, 128);
        return canvas.toDataURL();
      },

      getTileUrl: function (coords) {
        const { z, x, y } = coords;
        const s = this._getSubdomain(coords);
        return url
          .replace('{s}', s)
          .replace('{z}', z)
          .replace('{x}', x)
          .replace('{y}', y);
      },

      _getSubdomain: function (coords) {
        const subdomains = ['a', 'b', 'c'];
        const index = Math.abs(coords.x + coords.y) % subdomains.length;
        return subdomains[index];
      },
    });

    // Create and add layer to map
    const layer = new OfflineTileLayerClass(url, {
      attribution,
      ...options,
    });

    layer.addTo(map);
    layerRef.current = layer;

    // Cleanup
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, url, attribution, options]);

  return null;
};

export default OfflineTileLayer;
