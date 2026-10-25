export function estimatedPopulation(value) {
  return Number.isFinite(value) && value >= 0
    ? `Taxminan ${new Intl.NumberFormat('uz-UZ').format(value)} kishi`
    : 'Manbada ma’lumot yo‘q';
}

export function callingCodes(country) {
  const { root, suffixes = [] } = country.idd || {};
  if (!root) return 'Manbada ma’lumot yo‘q';
  if (root === '+1' && suffixes.length > 1) return '+1';
  if (root === '+7') return '+7';
  return [...new Set(suffixes.length ? suffixes.map(suffix => `${root}${suffix}`) : [root])].join(', ');
}

export function findMapCountry(countries, geo) {
  const id = String(geo.id).padStart(3, '0');
  return countries.find(country => country.ccn3 === id)
    || countries.find(country => country.name.common === geo.properties.name
      || country.name.official === geo.properties.name
      || country.altSpellings?.includes(geo.properties.name));
}

export const leaderQuery = `SELECT DISTINCT ?code ?country ?leader ?leaderLabel WHERE {
  ?country wdt:P297 ?code; p:P35 ?statement.
  ?statement ps:P35 ?leader; wikibase:rank ?rank.
  FILTER(?rank != wikibase:DeprecatedRank)
  FILTER NOT EXISTS { ?statement pq:P582 ?end. FILTER(?end <= NOW()) }
  FILTER NOT EXISTS { ?statement pq:P580 ?start. FILTER(?start > NOW()) }
  FILTER NOT EXISTS { ?leader wdt:P570 ?death. FILTER(?death <= NOW()) }
  FILTER(?rank = wikibase:PreferredRank || NOT EXISTS {
    ?country p:P35 ?preferred.
    ?preferred wikibase:rank wikibase:PreferredRank; ps:P35 ?other.
    FILTER NOT EXISTS { ?preferred pq:P582 ?e. FILTER(?e <= NOW()) }
    FILTER NOT EXISTS { ?preferred pq:P580 ?s. FILTER(?s > NOW()) }
  })
  SERVICE wikibase:label { bd:serviceParam wikibase:language "uz,en". }
}`;

export function parseLeaders(rows) {
  const countries = {};
  for (const row of rows) {
    const code = row.code?.value;
    const name = row.leaderLabel?.value;
    if (!/^[A-Z]{2}$/.test(code || '') || !name || /^Q\d+$/.test(name)) continue;
    countries[code] ||= { countryUrl: row.country.value, leaders: [] };
    if (!countries[code].leaders.some(leader => leader.url === row.leader.value)) {
      countries[code].leaders.push({ name, url: row.leader.value });
    }
  }
  return countries;
}

// One shared request, not one expensive query per country click.
let leadersPromise;
let snapshotPromise;
export function leaderSnapshot() {
  snapshotPromise ||= fetch('/data/leaders.json').then(async response => {
    if (!response.ok) throw new Error('Rahbarlar ma’lumoti yuklanmadi');
    return response.json();
  });
  return snapshotPromise;
}

export function loadLeaders() {
  leadersPromise ||= (async () => {
    const snapshot = await leaderSnapshot();
    try {
      const live = await fetch(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(leaderQuery)}`, {
        headers: { Accept: 'application/sparql-results+json' }, signal: AbortSignal.timeout(15000),
      });
      if (!live.ok) throw new Error('Manba vaqtincha javob bermadi');
      const data = await live.json();
      const countries = parseLeaders(data.results.bindings);
      if (Object.keys(countries).length < 100) throw new Error('Manba to‘liq javob bermadi');
      return { countries, fetchedAt: new Date().toISOString(), live: true };
    } catch { return { ...snapshot, live: false }; }
  })();
  return leadersPromise;
}
