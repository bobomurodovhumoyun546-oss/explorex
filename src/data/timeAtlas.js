export const atlasYears = [1700, 1715, 1783, 1800, 1815, 1878, 1880, 1900, 1914, 1920, 1930, 1938, 1945, 1960, 1994, 2000, 2010];
export const ATLAS_MIN_YEAR = 1700;
export const ATLAS_MAX_YEAR = 2026;

// Use the latest available snapshot at or before the requested year.
// The UI always discloses its actual date rather than inventing annual borders.
export function atlasSnapshotYear(year) {
  if (!Number.isInteger(year) || year < ATLAS_MIN_YEAR || year > ATLAS_MAX_YEAR) throw new RangeError('Yil 1700–2026 oralig‘ida bo‘lishi kerak');
  return atlasYears.findLast(value => value <= year);
}
export const atlasSource = 'https://github.com/aourednik/historical-basemaps';

export function territoryName(properties = {}) {
  return String(properties.NAME || properties.name || 'Nomi ko‘rsatilmagan hudud');
}

export function territoryColor(properties = {}) {
  const name = String(properties.SUBJECTO || properties.NAME || properties.name || 'region');
  let hash = 0;
  for (const char of name) hash = (Math.imul(hash, 31) + char.codePointAt(0)) | 0;
  return `hsl(${((hash % 360) + 360) % 360}, 42%, 38%)`;
}

export function atlasMapUrl(year) {
  if (!atlasYears.includes(year)) throw new RangeError('Bu yil uchun xarita mavjud emas');
  return `/maps/history/world_${year}.geojson`;
}
import { geoArea } from 'd3-geo';


// D3 uses clockwise outer rings. Some source snapshots contain a reversed
// polygon in Chile; normalize each polygon without changing the source files.
export function normalizeHistoricalMap(data) {
  function orient(coordinates) {
    return geoArea({ type: 'Polygon', coordinates }) > 2 * Math.PI
      ? coordinates.map(ring => [...ring].reverse()) : coordinates;
  }
  return {
    ...data,
    features: data.features.map(feature => {
      const geometry = feature.geometry;
      if (!geometry) return feature;
      if (geometry.type === 'Polygon') return { ...feature, geometry: { ...geometry, coordinates: orient(geometry.coordinates) } };
      if (geometry.type === 'MultiPolygon') return { ...feature, geometry: { ...geometry, coordinates: geometry.coordinates.map(orient) } };
      return feature;
    }),
  };
}
