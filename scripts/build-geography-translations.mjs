import { readFileSync, writeFileSync } from 'node:fs';

// Generate with Node's full ICU data. Some browsers advertise Uzbek support
// but ship incomplete DisplayNames data and silently return English names.
const countries = JSON.parse(readFileSync(new URL('../public/data/countries.json', import.meta.url)));
const labels = { countries: {}, languages: {}, currencies: {} };
const region = new Intl.DisplayNames(['uz'], {type:'region'});
const language = new Intl.DisplayNames(['uz'], {type:'language'});
const currency = new Intl.DisplayNames(['uz'], {type:'currency'});
const normalize = value => value.replace(/['’ʻʼ`]/g, '‘');
for (const country of countries) {
  labels.countries[country.cca2] = normalize(region.of(country.cca2));
  for (const code of Object.keys(country.languages || {})) labels.languages[code] = normalize(language.of(code));
  for (const code of Object.keys(country.currencies || {})) labels.currencies[code] = normalize(currency.of(code));
}
writeFileSync(new URL('../src/data/geographyLabels.json', import.meta.url), JSON.stringify(labels));
