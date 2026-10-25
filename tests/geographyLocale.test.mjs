import test from 'node:test';
import assert from 'node:assert/strict';
import { countryName, capitalName, currencyName, geographyQuery, languageName } from '../src/data/geographyLocale.js';

test('geography labels use Uzbek country, language, capital and currency names', () => {
  assert.equal(countryName({cca2:'FR',name:{common:'France'}}), 'Fransiya');
  assert.equal(countryName({name:{common:'Unknown territory'}}), 'Unknown territory');
  assert.equal(capitalName('Tashkent'), 'Toshkent');
  assert.equal(capitalName('Paris'), 'Parij');
  assert.match(languageName('eng','English'), /ingliz/);
  assert.match(currencyName('UZS','Uzbekistani som'), /so‘m/);
});

test('Uzbek search normalizes keyboard and typographic apostrophes', () => {
  assert.equal(geographyQuery("  O'zbekiston "), geographyQuery('O‘zbekiston'));
  assert.equal(geographyQuery('Oʻzbekiston'), geographyQuery('O‘zbekiston'));
  assert.equal(geographyQuery('Türkiye'), geographyQuery('Turkiye'));
});
