"""Download attributed historical map snapshots and period-matched flag assets."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
MAPS = ROOT / 'public/maps/history'
FLAGS = ROOT / 'public/flags/history'
FLAGS.mkdir(parents=True, exist_ok=True)


def download(url):
    for attempt in range(3):
        try:
            return urllib.request.urlopen(url, timeout=60).read()
        except Exception:
            if attempt == 2:
                raise


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf8')


manifest = json.loads((MAPS / 'SOURCE.json').read_text(encoding='utf8'))
years = [1700, 1715, 1783, 1800, 1815, 1878, 1880, 1900, 1914, 1920, 1930, 1938, 1945, 1960, 1994, 2000, 2010]


def map_asset(year):
    existing = next((m for m in manifest['maps'] if m['year'] == year), None)
    if existing:
        return existing
    url = f"https://raw.githubusercontent.com/aourednik/historical-basemaps/{manifest['commit']}/geojson/world_{year}.geojson"
    raw = download(url)
    data = json.loads(raw)
    write_json(MAPS / f'world_{year}.geojson', data)
    return dict(year=year, source=url, sourceSha256=hashlib.sha256(raw).hexdigest(), features=len(data['features']))


with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    manifest['maps'] = list(pool.map(map_asset, years))
write_json(MAPS / 'SOURCE.json', manifest)

commit = json.loads(download('https://api.github.com/repos/niemela/flags/commits/master'))['sha']
base = f'https://raw.githubusercontent.com/niemela/flags/{commit}/'
catalog = json.loads(download(base + 'data/flags.json'))['flags']
(FLAGS / 'LICENSE.txt').write_bytes(download(base + 'LICENSE'))


def normalize(name):
    return re.sub(r'[^a-z0-9]', '', name.lower())


aliases = {
    'USSR': 'Soviet Union', 'United States of America': 'United States',
    'United Kingdom of Great Britain and Ireland': 'United Kingdom',
    'Russian Empire': 'Russia', 'Qing Empire': 'Qing Dynasty', 'Manchu Empire': 'Qing Dynasty',
    'Austria Hungary': 'Austria-Hungary', 'Austro-Hungarian Empire': 'Austria-Hungary',
    'Empire of Japan': 'Japan', 'Imperial Japan': 'Japan',
    'Abyssinia': 'Ethiopia', 'Persia': 'Iran', 'Byelarus': 'Belarus',
    'Burma': 'Myanmar', 'Siam': 'Thailand', 'Surinam': 'Suriname',
    'Korea, Republic of': 'South Korea', "Korea, Democratic People's Republic of": 'North Korea',
    'Tanzania, United Republic of': 'Tanzania', 'Gambia, The': 'Gambia',
    'Bosnia-Herzegovina': 'Bosnia and Herzegovina', 'Swaziland': 'Eswatini',
    'West Germany': 'Germany', 'East Germany': 'German Democratic Republic',
    'Swiss Confederation': 'Switzerland', 'Dutch Republic': 'Netherlands',
}
by_name = {}
for flag in catalog:
    if 'country' not in flag.get('type', []) or not flag.get('t'):
        continue
    variants = flag.get('variant', [])
    if variants and not any(v in ['civil', 'state'] for v in variants):
        continue
    if not variants and '_' in flag['id'] and not flag['id'].split('_', 1)[1][0].isdigit():
        continue
    # Match exact entity names, ignoring a descriptive historical suffix.
    name = normalize(flag['name'].split(' (')[0])
    by_name.setdefault(name, []).append(flag)

names = set()
for year in years:
    data = json.loads((MAPS / f'world_{year}.geojson').read_text(encoding='utf8'))
    names.update(f['properties'].get('NAME') for f in data['features'])
entities = {}
assets = {}
for name in sorted(n for n in names if n):
    candidates = by_name.get(normalize(aliases.get(name, name)), [])
    candidates = [f for f in candidates if any(start is not None and start <= 2026 and (end is None or end >= 1700) for start, end in f['t'])]
    if candidates:
        entities[name] = [{'id': f['id'], 'name': f['name'], 'periods': f['t']} for f in candidates]
        assets.update({f['id']: f for f in candidates})


def flag_asset(identifier):
    raw = download(base + f'data/{identifier}.svg')
    if b'<script' in raw.lower():
        raise ValueError(identifier)
    (FLAGS / f'{identifier}.svg').write_bytes(raw)
    metadata = download(base + f'data/{identifier}.json')
    (FLAGS / f'{identifier}.json').write_bytes(metadata)
    return {'id': identifier, 'sha256': hashlib.sha256(raw).hexdigest()}


with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    downloaded = list(pool.map(flag_asset, assets))
write_json(ROOT / 'src/data/atlasFlags.json', entities)
write_json(FLAGS / 'SOURCE.json', dict(author='Fredrik Niemela and upstream flag authors', repository='https://github.com/niemela/flags', commit=commit, metadataLicense='CC BY-SA 4.0', imageLicense='Individual original licenses retained; see companion metadata sources.', processing='Exact country-name matching with explicit aliases; period years retained. No inferred flags for unknown entities.', assets=downloaded))
print(f'Prepared {len(years)} maps, {len(entities)} entities and {len(assets)} flag variants.')
