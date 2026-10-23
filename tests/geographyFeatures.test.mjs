import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FLAG_RECORDS_KEY, flagCountries, makeFlagQuestions, readFlagRecords, ROUND_COUNT, saveFlagRecord } from '../src/data/flagQuiz.js';
import { earthRecords, filterEarthRecords } from '../src/data/earthRecords.js';

function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('flag questions have unique targets and exactly four unique answer options', () => {
  let seed = 123;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const questions = makeFlagQuestions(random);
  assert.equal(questions.length, ROUND_COUNT);
  assert.equal(new Set(questions.map(q => q.country.code)).size, ROUND_COUNT);
  for (const question of questions) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options.map(o => o.code)).size, 4);
    assert.equal(question.options.filter(o => o.code === question.country.code).length, 1);
  }
  assert.notDeepEqual(questions, makeFlagQuestions(random));
});

test('top five records persist and can be read by a fresh session', () => {
  const storage = memoryStorage();
  for (const score of [2, 10, 4, 9, 6, 7, 8]) {
    assert.equal(saveFlagRecord(storage, { score, total: 10, date: '2026-10-22T12:00:00Z' }).saved, true);
  }
  assert.deepEqual(readFlagRecords(storage).map(r => r.score), [10, 9, 8, 7, 6]);
  assert.equal(JSON.parse(storage.getItem(FLAG_RECORDS_KEY)).length, 5);
});

test('malformed or unavailable browser storage never crashes the game', () => {
  const storage = memoryStorage();
  storage.setItem(FLAG_RECORDS_KEY, '{broken');
  assert.deepEqual(readFlagRecords(storage), []);
  storage.setItem(FLAG_RECORDS_KEY, JSON.stringify([null, { score: 100, total: 10, date: '2026-10-22' }, { score: 2, total: 10, date: 'bad' }]));
  assert.deepEqual(readFlagRecords(storage), []);
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  const result = saveFlagRecord(blocked, { score: 5, total: 10, date: '2026-10-22T12:00:00Z' });
  assert.equal(result.saved, false);
  assert.equal(result.records[0].score, 5);
});

test('all game flags are bundled SVG images with no active scripts', () => {
  assert.equal(flagCountries.length, 32);
  for (const country of flagCountries) {
    const svg = readFileSync(new URL(`../public/flags/${country.code}.svg`, import.meta.url), 'utf8');
    assert.match(svg, /<svg\b/);
    assert.doesNotMatch(svg, /<script\b/i);
  }
});

test('record filters combine category and normalized Uzbek text', () => {
  assert.equal(filterEarthRecords('mountains', '').length, 3);
  assert.equal(filterEarthRecords('all', '  EVEREST ').length, 1);
  assert.equal(filterEarthRecords('all', "cho'qqi").length, 3);
  assert.equal(filterEarthRecords('ocean', 'Everest').length, 0);
  assert.equal(filterEarthRecords('all', 'not-a-place').length, 0);
});

test('every record has a distinct ID, source and valid map coordinates', () => {
  assert.equal(new Set(earthRecords.map(r => r.id)).size, earthRecords.length);
  for (const record of earthRecords) {
    assert.ok(record.url.startsWith('https://'));
    const [longitude, latitude] = record.coordinates;
    assert.ok(Number.isFinite(longitude) && longitude >= -180 && longitude <= 180);
    assert.ok(Number.isFinite(latitude) && latitude >= -90 && latitude <= 90);
  }
});
