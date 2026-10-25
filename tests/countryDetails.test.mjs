import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { callingCodes, estimatedPopulation, findMapCountry, parseLeaders } from '../src/data/countryDetails.js';

const countries = JSON.parse(readFileSync(new URL('../public/data/countries.json', import.meta.url)));

test('population estimates display actual source numbers including small populations and zero', () => {
  assert.match(estimatedPopulation(37859698), /^Taxminan .* kishi$/);
  assert.equal(estimatedPopulation(49), 'Taxminan 49 kishi');
  assert.equal(estimatedPopulation(0), 'Taxminan 0 kishi');
  for (const value of [undefined, null, NaN, -1]) assert.equal(estimatedPopulation(value), 'Manbada ma’lumot yo‘q');
});

test('country calling codes handle Uzbekistan, shared codes and missing data', () => {
  for (const [code, expected] of [['UZ', '+998'], ['US', '+1'], ['CA', '+1'], ['KZ', '+7'], ['GB', '+44']]) {
    assert.equal(callingCodes(countries.find(country => country.cca2 === code)), expected);
  }
  assert.equal(callingCodes({}), 'Manbada ma’lumot yo‘q');
});

test('local country data contain all UN members and all requested reference fields', () => {
  assert.equal(countries.length, 250);
  assert.equal(countries.filter(country => country.unMember).length, 193);
  assert.equal(new Set(countries.map(country => country.cca2)).size, countries.length);
  for (const country of countries.filter(country => country.unMember)) {
    assert.ok(country.name.common && country.name.official);
    assert.ok(country.flags.svg);
    assert.ok(country.coatOfArms.svg || country.coatOfArms.png);
    assert.ok(country.capital.length);
    assert.ok(country.continents.length);
    assert.ok(Number.isFinite(country.area));
    assert.ok(Number.isFinite(country.population));
    assert.ok(Object.keys(country.languages).length);
    assert.ok(Object.keys(country.currencies).length);
    assert.ok(country.idd.root);
  }
});

test('map matching supports numeric IDs and countries without a matching map ID', () => {
  assert.equal(findMapCountry(countries, {id: '860', properties: {name: 'Uzbekistan'}}).cca2, 'UZ');
  assert.equal(findMapCountry(countries, {id: '-99', properties: {name: 'Kosovo'}}).cca2, 'XK');
});

test('leader parsing deduplicates people, excludes missing labels and preserves joint heads', () => {
  const row = name => ({code:{value:'SM'}, country:{value:'https://www.wikidata.org/entity/Q238'}, leader:{value:`https://www.wikidata.org/entity/${name}`}, leaderLabel:{value:name}});
  const result = parseLeaders([row('First leader'), row('Second leader'), row('First leader'), row('Q999')]);
  assert.deepEqual(result.SM.leaders.map(leader => leader.name), ['First leader', 'Second leader']);
});

test('leader snapshot is dated and links every named leader to its source', () => {
  const data = JSON.parse(readFileSync(new URL('../public/data/leaders.json', import.meta.url)));
  assert.ok(Number.isFinite(Date.parse(data.fetchedAt)));
  assert.ok(Object.keys(data.countries).length > 190);
  for (const country of Object.values(data.countries)) for (const leader of country.leaders) {
    assert.ok(leader.name && leader.url.includes('wikidata.org/entity/Q'));
  }
});

test('flags and available coats of arms load entirely from validated local image files', () => {
  for (const country of countries) for (const field of ['flags', 'coatOfArms']) {
    const image = country[field];
    if (!image?.svg && !image?.png) continue;
    const path = image.svg || image.png;
    assert.ok(path.startsWith('/country-media/'), `${country.cca2}: ${field}`);
    const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
    if (path.endsWith('.svg')) {
      assert.match(bytes.toString(), /<svg\b/);
      assert.doesNotMatch(bytes.toString(), /<script\b/i);
    } else {
      assert.ok(bytes.subarray(0,4).equals(Buffer.from([137,80,78,71])) || bytes.subarray(0,2).equals(Buffer.from([255,216])) || bytes.subarray(0,4).toString() === 'RIFF');
    }
  }
});
