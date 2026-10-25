"""Cache country images locally, retaining their upstream credit links."""
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
import os
from pathlib import Path
import time
import threading
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
DATA = PUBLIC / 'data/countries.json'
countries = json.loads(DATA.read_text(encoding='utf8'))
jobs = []
blocked_hosts = set()
host_lock = threading.Lock()
for country in countries:
    for field in ['flags', 'coatOfArms']:
        image = country.get(field, {})
        if image.get('unavailable'):
            continue
        url = image.get('sourceUrl') or image.get('svg') or image.get('png')
        if url and url.startswith('https://'):
            jobs.append((country, field, url))


def cache_image(job):
    country, field, url = job
    source_url = url
    extension = Path(urllib.parse.urlparse(url).path).suffix.lower()
    if extension not in ['.svg', '.png', '.jpg', '.jpeg', '.webp']:
        raise ValueError(f'Unexpected image: {url}')
    relative = f"/country-media/{field}/{country['cca2'].lower()}{extension}"
    target = PUBLIC / relative.lstrip('/')
    # Wikimedia asks automated clients to use standard thumbnails instead of
    # repeatedly fetching large originals. Keep originals already cached.
    if field == 'coatOfArms' and not target.exists() and 'upload.wikimedia.org/wikipedia/commons/' in url:
        parent, filename = url.rsplit('/', 1)
        suffix = '.png' if extension == '.svg' else ''
        url = parent.replace('/commons/', '/commons/thumb/') + '/' + filename + '/250px-' + filename + suffix
        extension = '.png' if suffix else extension
        relative = f"/country-media/{field}/{country['cca2'].lower()}{extension}"
        target = PUBLIC / relative.lstrip('/')
    target.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(3):
        try:
            if target.exists():
                raw = target.read_bytes()
            else:
                with host_lock:
                    if urllib.parse.urlparse(url).netloc in blocked_hosts:
                        raise RuntimeError('Host requested that automated downloads stop; existing local images retained')
                request = urllib.request.Request(url, headers={'User-Agent': 'ExploreX-Educational-Atlas/1.0'})
                raw = urllib.request.urlopen(request, timeout=25).read()
            if extension == '.svg':
                if b'<svg' not in raw or b'<script' in raw.lower():
                    raise ValueError('Invalid SVG')
            elif not (raw.startswith(b'\x89PNG') or raw.startswith(b'\xff\xd8') or raw.startswith(b'RIFF')):
                raise ValueError('Invalid raster image')
            target.write_bytes(raw)
            image = country[field]
            image['sourceUrl'] = source_url
            if field == 'coatOfArms' and 'upload.wikimedia.org' in source_url:
                image['creditUrl'] = 'https://commons.wikimedia.org/wiki/File:' + source_url.rsplit('/', 1)[-1]
            image['svg' if extension == '.svg' else 'png'] = relative
            # Ensure the browser never falls back to a blocked remote image.
            if extension == '.svg':
                image.pop('png', None)
            else:
                image.pop('svg', None)
            return {'country': country['cca2'], 'field': field, 'source': source_url, 'downloadUrl': url, 'local': relative, 'sha256': hashlib.sha256(raw).hexdigest()}
        except Exception as error:
            if isinstance(error, urllib.error.HTTPError) and error.code in [403, 429]:
                with host_lock:
                    blocked_hosts.add(urllib.parse.urlparse(url).netloc)
                return {'country': country['cca2'], 'field': field, 'source': source_url, 'error': str(error)}
            if isinstance(error, RuntimeError):
                return {'country': country['cca2'], 'field': field, 'source': source_url, 'error': str(error)}
            if attempt == 2:
                return {'country': country['cca2'], 'field': field, 'source': url, 'error': str(error)}
            time.sleep(3 * (attempt + 1))


results = []
with ThreadPoolExecutor(max_workers=int(os.environ.get('ATLAS_MEDIA_WORKERS', '4'))) as pool:
    futures = [pool.submit(cache_image, job) for job in jobs]
    for future in as_completed(futures):
        results.append(future.result())
        if 'error' in results[-1]:
            print(json.dumps(results[-1]), flush=True)
        if len(results) % 40 == 0:
            print(f'{len(results)}/{len(jobs)} images', flush=True)

DATA.write_text(json.dumps(countries, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
manifest = {'license': 'Images retain their original licenses; see the country image creditUrl/sourceUrl and original file page.', 'assets': results}
(PUBLIC / 'country-media/SOURCE.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
failed = [result for result in results if 'error' in result]
print(json.dumps({'cached': len(results) - len(failed), 'failed': failed}), flush=True)
