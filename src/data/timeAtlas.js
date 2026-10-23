export const atlasYears = [1700, 1800, 1900, 1914, 1945, 1960, 1994, 2010];
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
