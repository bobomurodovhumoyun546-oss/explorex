import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { callingCodes, estimatedPopulation, leaderSnapshot, loadLeaders } from '../data/countryDetails';
import { capitalName, currencyName, languageName } from '../data/geographyLocale';

const continents = { Africa: 'Afrika', Europe: 'Yevropa', Asia: 'Osiyo', Oceania: 'Okeaniya', 'North America': 'Shimoliy Amerika', 'South America': 'Janubiy Amerika', Antarctica: 'Antarktida', Americas: 'Amerikalar' };
const number = value => Number.isFinite(value) ? new Intl.NumberFormat('uz-UZ').format(value) : 'Manbada ma’lumot yo‘q';

function CountryImage({src, label, crop}) {
  const [failed, setFailed] = useState(false);
  return <figure className="rounded-xl border border-line bg-inset p-3 text-center">
    {src && !failed ? crop?.viewBox ? <svg viewBox={crop.viewBox} role="img" aria-label={label} className="mx-auto h-24 max-w-full"><image href={src} width={crop.imageWidth} height={crop.imageHeight} onError={() => setFailed(true)} /></svg> : <img src={src} alt={label} onError={() => setFailed(true)} className="mx-auto h-24 max-w-full object-contain" /> : <p className="flex h-24 items-center justify-center text-xs text-muted">{failed ? 'Rasm yuklanmadi' : 'Rasm hozircha mavjud emas'}</p>}
    <figcaption className="mt-2 text-xs text-subtle">{label}</figcaption>
  </figure>;
}

export default function CountryInfoPanel({country, displayName, onClose}) {
  const [leaders, setLeaders] = useState(null);
  const [leaderError, setLeaderError] = useState(false);
  const [provenance, setProvenance] = useState(null);
  const closeButton = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    closeButton.current?.focus();
    fetch('/data/countries-SOURCE.json').then(response => response.ok ? response.json() : null).then(setProvenance).catch(() => {});
    return () => { if (previousFocus?.isConnected) previousFocus.focus(); };
  }, []);
  useEffect(() => {
    function escape(event) {
      if (event.key === 'Escape') { event.stopImmediatePropagation(); onClose(); }
    }
    window.addEventListener('keydown', escape, true);
    return () => window.removeEventListener('keydown', escape, true);
  }, [onClose]);
  useEffect(() => {
    let active = true;
    let refreshed = false;
    leaderSnapshot().then(data => { if (active && !refreshed) setLeaders({...data, refreshing: true}); }).catch(() => {});
    loadLeaders().then(data => { refreshed = true; if (active) setLeaders(data); }).catch(() => { if (active) setLeaderError(true); });
    return () => { active = false; };
  }, []);
  const leader = leaders?.countries[country.cca2];
  const crestFile = country.coatOfArms?.creditUrl || (country.coatOfArms?.svg?.startsWith('https://upload.wikimedia.org/')
    ? `https://commons.wikimedia.org/wiki/File:${country.coatOfArms.svg.split('/').at(-1)}` : null);
  const currency = Object.entries(country.currencies || {}).map(([code, value]) => `${currencyName(code, value.name)} (${value.symbol || code}; ${code})`).join(', ');
  const rows = [
    ['Qit’asi', (country.continents?.length ? country.continents : [country.region]).map(value => continents[value] || value).filter(Boolean).join(', ')],
    ['Poytaxti', country.capital?.map(capitalName).join(', ')],
    ['Maydoni', Number.isFinite(country.area) ? `${number(country.area)} km²` : null],
    ['Aholisi (taxminiy)', estimatedPopulation(country.population)],
    ['Tillari', Object.entries(country.languages || {}).map(([code, value]) => languageName(code, value)).join(', ')],
    ['Valyutasi', currency],
    ['Prezident / davlat rahbari', leader?.leaders.map(item => item.name).join(', ') || (leaderError ? 'Ma’lumotni yuklab bo‘lmadi' : leaders ? 'Manbada amaldagi rahbar ko‘rsatilmagan' : 'Yuklanmoqda…')],
    ['Telefon kodi', callingCodes(country)],
  ];
  return createPortal(<section role="region" aria-label={`${displayName(country)} — davlat ma’lumotlari`} className="country-info-panel rounded-2xl border border-line bg-panel p-5 text-main shadow-2xl">
    <div className="sticky -top-5 z-10 -mx-1 flex items-center justify-between gap-3 bg-panel px-1 pb-3 pt-1"><h2 className="text-xl font-black">{displayName(country)}</h2><button ref={closeButton} type="button" onClick={onClose} aria-label="Davlat ma’lumotlarini yopish" className="rounded-lg bg-inset p-2"><X size={20} /></button></div>
    <p className="mb-4 text-sm text-muted">{country.name.official}</p>
    <div className="grid grid-cols-2 gap-3"><CountryImage key={country.flags?.svg || country.flags?.png || 'flag'} src={country.flags?.svg || country.flags?.png} label="Bayrog‘i" /><CountryImage key={country.coatOfArms?.svg || country.coatOfArms?.png || 'arms'} src={country.coatOfArms?.svg || country.coatOfArms?.png} crop={country.coatOfArms} label="Gerbi / davlat ramzi" /></div>
    <dl className="mt-5 space-y-3">{rows.map(([label, value]) => <div key={label} className="rounded-xl bg-inset p-3"><dt className="text-xs text-subtle">{label}</dt><dd className="mt-1 break-words text-sm font-semibold">{value || 'Manbada ma’lumot yo‘q'}</dd></div>)}</dl>
    <p className="mt-4 text-xs leading-5 text-subtle">Aholi soni manbadagi baho; jonli sanoq emas. Barcha davlatlarda prezident lavozimi mavjud emas.</p>
    {leaders && <p className="mt-3 text-xs leading-5 text-subtle">Rahbarlar tekshirilgan vaqt: {new Date(leaders.fetchedAt).toLocaleString('uz-UZ')}.{leaders.refreshing ? ' Jonli manbadan yangilanmoqda…' : !leaders.live && ' Jonli manba javob bermadi; saqlangan ma’lumot ko‘rsatilmoqda.'}</p>}
    <details className="mt-4 rounded-xl border border-line p-3 text-xs leading-6 text-subtle"><summary className="cursor-pointer font-semibold text-main">Ma’lumot sanalari va aniqligi</summary><p>Aholi baholangan yil: {country.populationYear || 'manbada ko‘rsatilmagan'}. Bu jonli hisoblagich emas.</p>{country.populationDate && <p>Aholi bahosi sanasi: {country.populationDate}.</p>}{country.populationSourceUrl && <a href={country.populationSourceUrl} target="_blank" rel="noreferrer" className="block text-cyan-700 underline dark:text-cyan-300">Aholi: rasmiy statistika manbasi</a>}{provenance?.retrievedAt && <p>Ma’lumot to‘plami olingan sana: {new Date(provenance.retrievedAt).toLocaleDateString('uz-UZ')}. Bu aholi baholangan sana emas.</p>}<p>Gerb manba tasviridir. Uning joriy rasmiy ko‘rinishga mosligi alohida tasdiqlanmagan; arxiv tasvirlari ham mavjud. Tekshirish uchun quyidagi manba havolasidan foydalaning.</p></details>
    <div className="mt-3 flex flex-wrap gap-3 text-xs text-cyan-700 underline dark:text-cyan-300"><a href="https://github.com/restcountries/restcountries" target="_blank" rel="noreferrer">Davlat ma’lumotlari manbasi</a><a href={leader?.countryUrl || 'https://www.wikidata.org/'} target="_blank" rel="noreferrer">Rahbarlar: Wikidata</a>{crestFile && <a href={crestFile} target="_blank" rel="noreferrer">Gerb: manba va mualliflar</a>}<a href="/data/countries-LICENSE.txt" target="_blank" rel="noreferrer">Ma’lumotlar litsenziyasi</a></div>
  </section>, document.body);
}
