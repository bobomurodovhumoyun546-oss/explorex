import test from 'node:test';
import assert from 'node:assert/strict';
import { readPreference, savePreference } from '../src/utils/preferences.js';

test('preferences reject corrupt values and tolerate blocked storage reads and writes', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    const values = new Map([['theme', 'light'], ['language', 'invalid']]);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    } });
    assert.equal(readPreference('theme', ['light', 'dark'], 'dark'), 'light');
    assert.equal(readPreference('language', ['uz', 'en', 'ru'], 'uz'), 'uz');
    savePreference('theme', 'dark');
    assert.equal(values.get('theme'), 'dark');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Access denied'); } });
    assert.equal(readPreference('theme', ['light', 'dark'], 'dark'), 'dark');
    assert.doesNotThrow(() => savePreference('theme', 'light'));
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
      getItem() { throw new Error('Blocked read'); },
      setItem() { throw new Error('Quota exceeded'); },
    } });
    assert.equal(readPreference('language', ['uz', 'en', 'ru'], 'uz'), 'uz');
    assert.doesNotThrow(() => savePreference('language', 'en'));
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});
