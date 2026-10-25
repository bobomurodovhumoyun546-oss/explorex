import labels from './geographyLabels.json' with { type: 'json' };

export function countryName(country) {
  if (!country.cca2) return country.name.common;
  const translated = labels.countries[country.cca2];
  return translated && translated !== country.cca2 ? translated : country.name.common;
}

export function languageName(code, fallback) {
  const translated = labels.languages[code];
  return translated && translated !== code ? translated : fallback;
}

export function currencyName(code, fallback) {
  return labels.currencies[code] || fallback || code;
}

const capitals = {
  Tashkent: 'Toshkent', Astana: 'Ostona', Ashgabat: 'Ashxobod', Dushanbe: 'Dushanbe',
  Moscow: 'Moskva', Kyiv: 'Kiyev', Beijing: 'Pekin', Tokyo: 'Tokio', Seoul: 'Seul',
  Pyongyang: 'Pxenyan', 'New Delhi': 'Nyu-Dehli', Islamabad: 'Islomobod',
  Tehran: 'Tehron', Baghdad: 'Bag‘dod', Riyadh: 'Ar-Riyod', 'Abu Dhabi': 'Abu-Dabi',
  Cairo: 'Qohira', Damascus: 'Damashq', Jerusalem: 'Quddus', Beirut: 'Bayrut',
  Paris: 'Parij', Rome: 'Rim', Vienna: 'Vena', Warsaw: 'Varshava', Prague: 'Praga',
  Athens: 'Afina', Brussels: 'Bryussel', Lisbon: 'Lissabon', Copenhagen: 'Kopengagen',
  Stockholm: 'Stokgolm', Bucharest: 'Buxarest', Belgrade: 'Belgrad', Sofia: 'Sofiya',
  Budapest: 'Budapesht', Bern: 'Bern', 'Washington, D.C.': 'Vashington',
  'Mexico City': 'Mexiko', 'Buenos Aires': 'Buenos-Ayres',
  'Kuala Lumpur': 'Kuala-Lumpur', Dhaka: 'Dakka', Hanoi: 'Xanoy',
  Jakarta: 'Jakarta', 'Vatican City': 'Vatikan', 'Sri Jayawardenepura Kotte': 'Shri-Jayavardenepura-Kotte',
};

export function capitalName(value) { return capitals[value] || value; }

export function geographyQuery(value) {
  return String(value).normalize('NFKD').replace(/\p{M}/gu, '').replace(/['‘’ʻʼ`]/g, '').toLocaleLowerCase('uz').trim();
}
