export const FLAG_RECORDS_KEY = 'explorex.flagQuiz.records.v1';
export const ROUND_COUNT = 10;

export const flagCountries = [
  ['uz', 'O‘zbekiston'], ['kz', 'Qozog‘iston'], ['kg', 'Qirg‘iziston'],
  ['tj', 'Tojikiston'], ['tm', 'Turkmaniston'], ['az', 'Ozarbayjon'],
  ['tr', 'Turkiya'], ['us', 'AQSH'], ['ca', 'Kanada'], ['mx', 'Meksika'],
  ['br', 'Braziliya'], ['ar', 'Argentina'], ['gb', 'Buyuk Britaniya'],
  ['fr', 'Fransiya'], ['de', 'Germaniya'], ['it', 'Italiya'], ['es', 'Ispaniya'],
  ['pt', 'Portugaliya'], ['ch', 'Shveytsariya'], ['se', 'Shvetsiya'],
  ['no', 'Norvegiya'], ['ua', 'Ukraina'], ['cn', 'Xitoy'], ['jp', 'Yaponiya'],
  ['kr', 'Janubiy Koreya'], ['in', 'Hindiston'], ['pk', 'Pokiston'],
  ['id', 'Indoneziya'], ['au', 'Avstraliya'], ['nz', 'Yangi Zelandiya'],
  ['eg', 'Misr'], ['za', 'Janubiy Afrika'],
].map(([code, name]) => ({ code, name }));

function shuffle(items, random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function makeFlagQuestions(random = Math.random) {
  return shuffle(flagCountries, random).slice(0, ROUND_COUNT).map(country => ({
    country,
    options: shuffle([
      country,
      ...shuffle(flagCountries.filter(item => item.code !== country.code), random).slice(0, 3),
    ], random),
  }));
}

export function validFlagRecords(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && Number.isInteger(item.score)
    && item.score >= 0 && item.score <= ROUND_COUNT && item.total === ROUND_COUNT
    && typeof item.date === 'string' && Number.isFinite(Date.parse(item.date)))
    .map(({ score, total, date }) => ({ score, total, date }))
    .sort((a, b) => b.score - a.score || Date.parse(b.date) - Date.parse(a.date)).slice(0, 5);
}

export function readFlagRecords(storage) {
  try { return validFlagRecords(JSON.parse(storage.getItem(FLAG_RECORDS_KEY) || '[]')); }
  catch { return []; }
}

export function saveFlagRecord(storage, result) {
  const records = validFlagRecords([...readFlagRecords(storage), result]);
  try {
    storage.setItem(FLAG_RECORDS_KEY, JSON.stringify(records));
    return { records, saved: true };
  } catch { return { records, saved: false }; }
}
