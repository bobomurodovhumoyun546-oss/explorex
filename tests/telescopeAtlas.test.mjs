import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { geoArea, geoContains } from 'd3-geo';
import { atlasSnapshotYear, atlasMapUrl, atlasYears, normalizeHistoricalMap, territoryColor, territoryName } from '../src/data/timeAtlas.js';
import { makeAtlasFlagMarkers, territoryFlag } from '../src/data/atlasFlagMarkers.js';
import { filterTelescopeImages, telescopeImages } from '../src/data/telescopeGallery.js';

test('every selectable atlas year has real, distinct polygon data', () => {
  const hashes = new Set();
  for (const year of atlasYears) {
    const raw = readFileSync(new URL(`../public${atlasMapUrl(year)}`, import.meta.url));
    const data = JSON.parse(raw);
    assert.equal(data.type, 'FeatureCollection');
    assert.ok(data.features.length > 100);
    assert.ok(data.features.some(feature => ['Polygon', 'MultiPolygon'].includes(feature.geometry?.type)));
    hashes.add(createHash('sha256').update(raw).digest('hex'));
  }
  assert.equal(hashes.size, atlasYears.length);
  assert.throws(() => atlasMapUrl(1915), RangeError);
});

test('historical polygon orientation never fills the whole globe', () => {
  for (const year of atlasYears) {
    const source = JSON.parse(readFileSync(new URL(`../public${atlasMapUrl(year)}`, import.meta.url)));
    const original = JSON.stringify(source);
    const data = normalizeHistoricalMap(source);
    for (const feature of data.features) assert.ok(geoArea(feature) < 2 * Math.PI, `${year}: ${territoryName(feature.properties)}`);
    assert.equal(JSON.stringify(source), original);
  }
});

test('every year 1700–2026 resolves to a disclosed existing prior snapshot', () => {
  for (let year = 1700; year <= 2026; year++) {
    const snapshot = atlasSnapshotYear(year);
    assert.ok(snapshot <= year && atlasYears.includes(snapshot));
    assert.ok(!atlasYears.some(value => value > snapshot && value <= year));
  }
  assert.equal(atlasSnapshotYear(2026), 2010);
  for (const invalid of [1699, 2027, NaN, 1914.5]) assert.throws(() => atlasSnapshotYear(invalid), RangeError);
});

test('historical flags change with their periods and do not fill unknown periods with modern flags', () => {
  assert.equal(territoryFlag({ NAME: 'United States' }, 2026).id, 'US');
  assert.notEqual(territoryFlag({ NAME: 'United States' }, 1900).id, 'US');
  assert.equal(territoryFlag({ NAME: 'Uzbekistan' }, 1800), null);
  assert.equal(territoryFlag({ NAME: 'Uzbekistan' }, 2026).id, 'UZ');
  assert.match(territoryFlag({ NAME: 'USSR' }, 1960).id, /SUHH/);
  assert.equal(territoryFlag({ NAME: 'Unknown polity' }, 2026), null);
});

test('flag anchors lie on their territory and all displayed flag assets are local', () => {
  for (const year of atlasYears) {
    const data = normalizeHistoricalMap(JSON.parse(readFileSync(new URL(`../public${atlasMapUrl(year)}`, import.meta.url))));
    const markers = makeAtlasFlagMarkers(data, year);
    assert.ok(markers.length > 0, String(year));
    for (const marker of markers) {
      assert.ok(geoContains(data.features[marker.index], marker.coordinates), `${year}: ${territoryName(marker.properties)}`);
      const svg = readFileSync(new URL(`../public/flags/history/${marker.flag.id}.svg`, import.meta.url), 'utf8');
      assert.match(svg, /<svg\b/);
      assert.doesNotMatch(svg, /<script\b/i);
    }
  }
});

test('atlas territory names and colors are stable across snapshots', () => {
  assert.equal(territoryName({ NAME: 'Ottoman Empire' }), 'Ottoman Empire');
  assert.equal(territoryColor({ NAME: 'A', SUBJECTO: 'B' }), territoryColor({ NAME: 'C', SUBJECTO: 'B' }));
  assert.ok(territoryName({}).length > 0);
});

test('gallery filters by telescope and object name', () => {
  assert.equal(telescopeImages.length, 6);
  assert.equal(filterTelescopeImages('Webb', '').length, 4);
  assert.equal(filterTelescopeImages('Hubble', '').length, 2);
  assert.equal(filterTelescopeImages('all', '  M51 ').length, 1);
  assert.equal(filterTelescopeImages('Webb', 'M51').length, 0);
});

test('all gallery photos are local images with source credits', () => {
  for (const image of telescopeImages) {
    const bytes = readFileSync(new URL(`../public${image.image}`, import.meta.url));
    assert.ok(bytes.length > 10000);
    assert.ok(bytes.subarray(0,4).equals(Buffer.from([137,80,78,71])) || bytes.subarray(0,3).equals(Buffer.from([255,216,255])));
    assert.ok(image.sourceUrl.startsWith('https://science.nasa.gov/'));
    assert.ok(image.credit.length > 5);
  }
});

test('historical data retain license and pinned source provenance', () => {
  const license = readFileSync(new URL('../public/maps/history/LICENSE.txt', import.meta.url), 'utf8');
  const source = JSON.parse(readFileSync(new URL('../public/maps/history/SOURCE.json', import.meta.url)));
  assert.match(license, /GNU GENERAL PUBLIC LICENSE/);
  assert.match(source.commit, /^[a-f0-9]{40}$/);
  assert.equal(source.maps.length, atlasYears.length);
  assert.ok(source.maps.every(map => map.sourceSha256 && map.features > 0));
});
