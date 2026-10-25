import MapViewport from "../components/MapViewport";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { ArrowLeft, ChevronLeft, ChevronRight, History, ZoomIn, ZoomOut } from 'lucide-react';
import { ATLAS_MIN_YEAR, ATLAS_MAX_YEAR, atlasSnapshotYear, atlasMapUrl, atlasSource, atlasYears, normalizeHistoricalMap, territoryColor, territoryName } from '../data/timeAtlas';

import { makeAtlasFlagMarkers, territoryFlag } from '../data/atlasFlagMarkers';

export default function TimeAtlas() {
  const [year, setYear] = useState(1914);
  const [showFlags, setShowFlags] = useState(true);
  const [compare, setCompare] = useState(false);
  const [layer, setLayer] = useState({ status: 'loading' });
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([0, 15]);
  const cacheRef = useRef(new Map());
  const snapshotYear = atlasSnapshotYear(year);
  const previousYear = atlasYears[atlasYears.indexOf(snapshotYear) - 1];

  useEffect(() => {
    const controller = new AbortController();
    async function loadYear(value) {
      if (cacheRef.current.has(value)) return cacheRef.current.get(value);
      const response = await fetch(atlasMapUrl(value), { signal: controller.signal });
      if (!response.ok) throw new Error('Xarita yuklanmadi');
      const data = await response.json();
      if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('Xarita formati noto‘g‘ri');
      const normalized = normalizeHistoricalMap(data);
      cacheRef.current.set(value, normalized);
      return normalized;
    }
    Promise.all([loadYear(snapshotYear), compare && previousYear ? loadYear(previousYear) : Promise.resolve(null)])
      .then(([data, previous]) => { if (!controller.signal.aborted) setLayer({ year: snapshotYear, compare, data, previous, status: 'ready' }); })
      .catch(error => { if (error.name !== 'AbortError' && !controller.signal.aborted) setLayer({ year: snapshotYear, compare, status: 'error' }); });
    return () => controller.abort();
  }, [snapshotYear, compare, previousYear, retry]);

  const ready = layer.year === snapshotYear && layer.compare === compare && layer.status === 'ready';
  const failed = layer.year === snapshotYear && layer.compare === compare && layer.status === 'error';

  const markers = useMemo(() => layer.data ? makeAtlasFlagMarkers(layer.data, year) : [], [layer.data, year]);
  const selectedFlag = selected && territoryFlag(selected.properties, year);

  function changeYear(value) {
    setYear(Math.max(ATLAS_MIN_YEAR, Math.min(ATLAS_MAX_YEAR, value)));
    setSelected(null);
    if (atlasSnapshotYear(Math.max(ATLAS_MIN_YEAR, Math.min(ATLAS_MAX_YEAR, value))) === ATLAS_MIN_YEAR) setCompare(false);
  }

  return <main className="min-h-screen bg-page px-4 pb-16 pt-28 text-main sm:px-6">
    <div className="mx-auto max-w-7xl">
      <Link to="/geography" className="mb-7 inline-flex items-center gap-2 text-sm text-muted hover:text-main"><ArrowLeft size={17} /> Geografiyaga qaytish</Link>
      <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[.25em] text-orange-700 dark:text-orange-300"><History size={17} /> TARIX BO‘YLAB SAYOHAT</p>
      <h1 className="text-4xl font-black sm:text-5xl">Time Atlas</h1>
      <p className="mt-4 max-w-3xl leading-7 text-muted">Yilni tanlang va davlatlar, imperiyalar hamda mustamlaka hududlari chegaralarining o‘zgarishini kuzating.</p>
      <section className="my-7 rounded-3xl border border-orange-300/20 bg-panel p-5 sm:p-6" aria-label="Tarixiy yilni tanlash">
        <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><button aria-label="Oldingi yil" disabled={year === ATLAS_MIN_YEAR} onClick={() => changeYear(year - 1)} className="rounded-xl bg-inset p-2 disabled:opacity-30"><ChevronLeft /></button><input type="number" aria-label="Yilni kiriting" min={ATLAS_MIN_YEAR} max={ATLAS_MAX_YEAR} key={year} defaultValue={year} onBlur={event => { const value = event.target.valueAsNumber; if (Number.isInteger(value)) changeYear(value); else event.target.value = year; }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} className="w-32 rounded-xl bg-inset py-2 text-center text-3xl font-black tabular-nums text-orange-700 dark:text-orange-300" /><button aria-label="Keyingi yil" disabled={year === ATLAS_MAX_YEAR} onClick={() => changeYear(year + 1)} className="rounded-xl bg-inset p-2 disabled:opacity-30"><ChevronRight /></button></div><label className="text-sm"><input type="checkbox" checked={compare} disabled={!previousYear} onChange={event => setCompare(event.target.checked)} className="mr-2 accent-orange-300" />Oldingi qatlam chegaralari {previousYear ? `(${previousYear})` : ''}</label></div>
        <input aria-label="Xarita yili" aria-valuetext={String(year)} className="my-5 w-full accent-orange-300" type="range" min={ATLAS_MIN_YEAR} max={ATLAS_MAX_YEAR} step="1" value={year} onChange={event => changeYear(Number(event.target.value))} />
        <div className="flex flex-wrap gap-2">{atlasYears.map(value => <button key={value} aria-pressed={value === year} onClick={() => changeYear(value)} className={`rounded-lg px-3 py-2 text-sm ${value === year ? 'bg-orange-300 font-bold text-slate-950' : 'bg-inset hover:bg-hover'}`}>{value}</button>)}</div>
        <p className="mt-4 text-xs leading-5 text-subtle">1700–2026: har bir yilni tanlash mumkin. Tugmalar manbada mavjud xarita yillarini bildiradi. Oraliq yillarda eng so‘nggi oldingi qatlam ko‘rsatiladi; chegaralar har yil uchun alohida hisoblanmagan.</p>
      <p role="status" className="mt-3 text-sm font-semibold text-orange-700 dark:text-orange-300">Tanlangan yil: {year}. Chegaralar qatlami: {snapshotYear}.{snapshotYear !== year && ' Bu yil uchun alohida chegara ma’lumoti mavjud emas.'}</p>
      </section>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        <MapViewport className="overflow-hidden rounded-3xl border border-line bg-panel" aria-label={`${year}-yil xaritasi`} aria-busy={!ready && !failed} overlay={<div role="region" aria-label="Xarita sanasi" className="text-xs leading-6"><p>Tanlangan yil: <strong>{year}</strong></p><p>Chegaralar qatlami: <strong>{snapshotYear}</strong></p>{snapshotYear !== year && <p className="text-subtle">Tanlangan yil uchun alohida chegara ma’lumoti yo‘q.</p>}</div>}>
          <div className="flex flex-wrap justify-between gap-3 border-b border-line p-4"><div className="flex flex-wrap gap-2">{[['Dunyo',[0,15],1],['Markaziy Osiyo',[65,40],3.5],['Yevropa',[15,50],3.5]].map(([label,position,scale]) => <button key={label} onClick={() => {setCenter(position);setZoom(scale);}} className="rounded-lg bg-inset px-3 py-2 text-xs hover:bg-hover">{label}</button>)}</div><div className="flex items-center gap-2"><label className="mr-2 text-xs"><input type="checkbox" checked={showFlags} onChange={event => setShowFlags(event.target.checked)} className="mr-1 accent-orange-300" />Bayroqlar</label><button aria-label="Xaritani kattalashtirish" onClick={() => setZoom(value => Math.min(10,value*1.5))} className="rounded-lg bg-inset p-2"><ZoomIn size={18} /></button><button aria-label="Xaritani kichraytirish" onClick={() => setZoom(value => Math.max(1,value/1.5))} className="rounded-lg bg-inset p-2"><ZoomOut size={18} /></button></div></div>
          <div data-map-canvas>{ready ? <ComposableMap projection="geoEqualEarth" projectionConfig={{scale:155}} width={900} height={480} style={{width:'100%',height:'auto'}}>
            <ZoomableGroup center={center} zoom={zoom} maxZoom={10} onMoveEnd={({coordinates,zoom:nextZoom}) => {setCenter(coordinates);setZoom(nextZoom);}}>
              <Geographies geography={layer.data}>{({geographies}) => geographies.map(geo => <Geography key={`${year}-${geo.rsmKey}`} geography={geo} fill={selected && territoryName(selected.properties) === territoryName(geo.properties) ? '#fb923c' : territoryColor(geo.properties)} stroke="#d5e5f0" strokeWidth={.35/zoom} tabIndex={0} role="button" aria-label={territoryName(geo.properties)} onClick={() => setSelected({key:geo.rsmKey,properties:geo.properties})} onKeyDown={event => {if(event.key === 'Enter' || event.key === ' ') {event.preventDefault();setSelected({key:geo.rsmKey,properties:geo.properties});}}} style={{default:{outline:'none'},hover:{fill:'#fb923c',outline:'none'},pressed:{fill:'#f97316',outline:'none'}}}><title>{territoryName(geo.properties)}</title></Geography>)}</Geographies>
              {layer.previous && <Geographies geography={layer.previous}>{({geographies}) => geographies.map(geo => <Geography key={`previous-${geo.rsmKey}`} geography={geo} fill="none" stroke="#fde047" strokeWidth={1/zoom} strokeDasharray={`${3/zoom} ${2/zoom}`} pointerEvents="none" />)}</Geographies>}
              {showFlags && markers.map(marker => <Marker key={`${marker.index}-${marker.flag.id}`} coordinates={marker.coordinates}>
                <g transform={`scale(${1 / zoom})`} role="button" tabIndex={0} aria-label={`${territoryName(marker.properties)}: ${marker.flag.name}`} className="cursor-pointer" onClick={() => setSelected({properties: marker.properties})} onKeyDown={event => {if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();setSelected({properties: marker.properties});}}}>
                  <title>{territoryName(marker.properties)} — {marker.flag.name}</title>
                  <rect x={-13} y={-9} width={26} height={18} rx={2} fill="white" stroke="#334155" strokeWidth={.8} />
                  <image href={`/flags/history/${marker.flag.id}.svg`} x={-12} y={-8} width={24} height={16} preserveAspectRatio="xMidYMid meet" />
                </g>
              </Marker>)}
            </ZoomableGroup>
          </ComposableMap> : <div className="flex min-h-80 flex-col items-center justify-center gap-4 p-8 text-center" role="status">{failed ? <><p>Xaritani yuklab bo‘lmadi.</p><button onClick={() => setRetry(value => value + 1)} className="rounded-xl bg-orange-300 px-4 py-2 font-bold text-slate-950">Qayta urinish</button></> : <p>{year}-yil xaritasi yuklanmoqda…</p>}</div>}</div>
          <p className="px-4 pb-4 text-xs text-subtle">Oq chiziq — {snapshotYear}-yil chegarasi.{compare && previousYear ? ` Sariq uzilgan chiziq — ${previousYear}-yil chegarasi.` : ''}</p>
        </MapViewport>
        <aside className="space-y-5 rounded-3xl border border-line bg-panel p-6">{selectedFlag && <img src={`/flags/history/${selectedFlag.id}.svg`} alt={selectedFlag.name} className="max-h-24 max-w-full rounded shadow" />}<h2 className="text-xl font-bold">{selected ? territoryName(selected.properties) : 'Hududni tanlang'}</h2>{selected ? <dl className="space-y-4 text-sm"><div><dt className="text-subtle">Tanlangan yil / chegara qatlami</dt><dd className="mt-1 text-orange-700 dark:text-orange-300">{year} / {snapshotYear}</dd></div>{selected.properties.SUBJECTO && <div><dt className="text-subtle">Manbadagi siyosiy mansublik</dt><dd className="mt-1">{String(selected.properties.SUBJECTO)}</dd></div>}{selected.properties.PARTOF && <div><dt className="text-subtle">Kengroq hudud</dt><dd className="mt-1">{String(selected.properties.PARTOF)}</dd></div>}<div><dt className="text-subtle">Bayroq</dt><dd className="mt-1">{selectedFlag ? selectedFlag.name : 'Bu hudud va yil uchun tasdiqlangan bayroq mavjud emas.'}</dd></div></dl> : <p className="text-sm leading-7 text-muted">Xaritadagi hududni bosing. Nomlar asl ma’lumot to‘plamidagi shaklda beriladi.</p>}<p className="text-xs leading-6 text-subtle">Tarixiy chegaralar soddalashtirilgan rekonstruksiyadir. Bo‘sh joylar ma’lumot qamrovini bildirishi mumkin; ular avtomatik ravishda mustaqil davlat degani emas.</p><a href={atlasSource} target="_blank" rel="noreferrer" className="block text-xs text-cyan-700 dark:text-cyan-300 underline">André Ourednik — Historical Basemaps</a><a href="/maps/history/LICENSE.txt" target="_blank" rel="noreferrer" className="block text-xs text-cyan-700 dark:text-cyan-300 underline">Ma’lumotlar litsenziyasi</a><p className="text-xs leading-6 text-subtle">Bayroqlar tanlangan yilning manbadagi davriga mos ko‘rsatiladi. Yil ichidagi o‘zgarishlar soddalashtirilgan. Ma’lumoti yo‘q hududlarga zamonaviy bayroq qo‘yilmaydi.</p><a href="https://github.com/niemela/flags" target="_blank" rel="noreferrer" className="block text-xs text-cyan-700 dark:text-cyan-300 underline">Fredrik Niemelä — tarixiy bayroqlar</a><a href="/flags/history/LICENSE.txt" target="_blank" rel="noreferrer" className="block text-xs text-cyan-700 dark:text-cyan-300 underline">Bayroq metama’lumotlari: CC BY-SA 4.0; tasvirlar: asl litsenziyalar</a><p className="text-xs text-subtle">Xaritalar va bayroqlar loyiha ichidan yuklanadi.</p></aside>
      </div>
    </div>
  </main>;
}
