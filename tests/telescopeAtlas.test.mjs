import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { geoArea } from 'd3-geo';
import { atlasMapUrl, atlasYears, normalizeHistoricalMap, territoryColor, territoryName } from '../src/data/timeAtlas.js';
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
