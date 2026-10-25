import { geoArea, geoBounds, geoCentroid, geoContains, geoDistance } from 'd3-geo';
import flagData from './atlasFlags.json' with { type: 'json' };
import { territoryName } from './timeAtlas.js';

const positionCache = new WeakMap();

export function territoryFlag(properties, year) {
  const flags = flagData[territoryName(properties)] || [];
  return flags.flatMap(flag => flag.periods
    .filter(([start, end]) => start !== null && start <= year && (end === null || year < end))
    .map(([start]) => ({ ...flag, start })))
    .sort((a, b) => b.start - a.start || a.id.length - b.id.length)[0] || null;
}

// Anchor on the largest mainland polygon, not an overseas island or ocean centroid.
export function territoryFlagPosition(feature) {
  const geometry = feature.geometry;
  if (!geometry || !['Polygon', 'MultiPolygon'].includes(geometry.type)) return null;
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const polygon = polygons.map(coordinates => ({ type: 'Polygon', coordinates }))
    .sort((a, b) => geoArea(b) - geoArea(a))[0];
  const centroid = geoCentroid(polygon);
  if (geoContains(polygon, centroid)) return centroid;
  const [[west, south], [east, north]] = geoBounds(polygon);
  const width = ((east - west) + 360) % 360;
  const candidates = [];
  for (let x = 1; x < 12; x++) for (let y = 1; y < 12; y++) {
    const longitude = ((west + width * x / 12 + 540) % 360) - 180;
    const point = [longitude, south + (north - south) * y / 12];
    if (geoContains(polygon, point)) candidates.push(point);
  }
  return candidates.sort((a, b) => geoDistance(a, centroid) - geoDistance(b, centroid))[0] || null;
}

export function makeAtlasFlagMarkers(data, year) {
  // Some countries have separate features for enclaves and islands. Display
  // one flag on the largest territory instead of repeating it over each fragment.
  const territories = new Map();
  data.features.forEach((feature, index) => {
    const name = territoryName(feature.properties);
    const area = geoArea(feature);
    if (!territories.has(name) || area > territories.get(name).area) territories.set(name, { feature, index, area });
  });
  return [...territories.values()].flatMap(({feature, index}) => {
    const flag = territoryFlag(feature.properties, year);
    if (flag && !positionCache.has(feature)) positionCache.set(feature, territoryFlagPosition(feature));
    const coordinates = flag && positionCache.get(feature);
    return coordinates ? [{ flag, coordinates, index, properties: feature.properties }] : [];
  });
}
