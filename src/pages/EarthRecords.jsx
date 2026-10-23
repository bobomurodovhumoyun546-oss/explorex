import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { ArrowLeft, ExternalLink, Globe2, MapPin, Search, ZoomIn, ZoomOut } from 'lucide-react';
import worldMap from '../data/worldCountries.json';
import { earthRecords, filterEarthRecords, recordCategories } from '../data/earthRecords';

export default function EarthRecords() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(earthRecords[0].id);
  const [center, setCenter] = useState([0, 0]);
  const [zoom, setZoom] = useState(1);
  const visible = filterEarthRecords(category, query);
  const selected = visible.find(record => record.id === selectedId) || visible[0];

  function choose(record) { setSelectedId(record.id); }
  function resetMap() { setCenter([0, 0]); setZoom(1); }

  return <main className="min-h-screen bg-page px-4 pb-16 pt-28 text-main sm:px-6">
    <div className="mx-auto max-w-7xl">
      <Link to="/geography" className="mb-7 inline-flex items-center gap-2 text-sm text-muted hover:text-main"><ArrowLeft size={17} /> Geografiyaga qaytish</Link>
      <p className="mb-3 text-xs font-bold tracking-[.25em] text-violet-700 dark:text-violet-300">YER SAYYORASINING MO‘JIZALARI</p>
      <h1 className="text-3xl font-black sm:text-5xl">Yer rekordlari</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted">Eng baland cho‘qqilardan okean tubiga qadar. Kategoriya tanlang, xaritadagi belgini yoki kartani bosib rekord haqida bilib oling.</p>
      <div className="my-7 flex flex-col justify-between gap-4 lg:flex-row">
        <div className="flex flex-wrap gap-2" aria-label="Rekord kategoriyalari">{recordCategories.map(([id,label]) => <button key={id} aria-pressed={category === id} onClick={() => {setCategory(id);resetMap();}} className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${category === id ? 'border-violet-300 bg-violet-400/20 text-violet-700 dark:text-violet-200' : 'border-line bg-inset hover:bg-hover'}`}>{label}</button>)}</div>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-inset px-3 py-2"><Search size={18} className="text-subtle" /><span className="sr-only">Rekord qidirish</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Joy yoki rekordni qidiring..." className="min-w-0 bg-transparent text-sm outline-none" /></label>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <section className="overflow-hidden rounded-3xl border border-line bg-panel" aria-label="Rekordlar xaritasi">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4"><h2 className="flex items-center gap-2 text-sm font-bold"><Globe2 size={18} className="text-violet-700 dark:text-violet-300" /> Interaktiv xarita</h2><div className="flex items-center gap-2"><button onClick={resetMap} className="rounded-lg bg-inset px-3 py-2 text-xs hover:bg-hover">Butun dunyo</button><button aria-label="Xaritani kattalashtirish" onClick={() => setZoom(value => Math.min(8,value*1.5))} className="rounded-lg bg-inset p-2"><ZoomIn size={18} /></button><button aria-label="Xaritani kichraytirish" onClick={() => setZoom(value => Math.max(1,value/1.5))} className="rounded-lg bg-inset p-2"><ZoomOut size={18} /></button></div></div>
          <ComposableMap projection="geoEqualEarth" projectionConfig={{scale:145}} width={900} height={450} style={{width:'100%',height:'auto'}}>
            <ZoomableGroup center={center} zoom={zoom} maxZoom={8} onMoveEnd={({coordinates,zoom:nextZoom}) => {setCenter(coordinates);setZoom(nextZoom);}}>
              <Geographies geography={worldMap}>
                {({geographies}) => geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#263b55"
                    stroke="#101b31"
                    strokeWidth={.5/zoom}
                    style={{default:{outline:'none'},hover:{outline:'none',fill:'#334c6b'},pressed:{outline:'none'}}}
                  />
                ))}
              </Geographies>
              {visible.map(record => <Marker key={record.id} coordinates={record.coordinates} role="button" tabIndex={0} aria-label={record.name} onClick={() => choose(record)} onKeyDown={event => {if(event.key === 'Enter' || event.key === ' ') {event.preventDefault();choose(record);}}} className="cursor-pointer focus:outline focus:outline-2 focus:outline-white"><circle r={(record.id === selected?.id ? 7 : 5)/zoom} fill={record.id === selected?.id ? '#fbbf24' : '#c4b5fd'} stroke="#fff" strokeWidth={1/zoom} /><title>{record.name} — {record.value}</title></Marker>)}
            </ZoomableGroup>
          </ComposableMap>
          <p className="px-4 pb-4 text-xs leading-5 text-subtle">Belgilar joylashuvni taxminan ko‘rsatadi. Daryo, cho‘l va okean uchun bitta shartli nuqta berilgan. Xaritani surish va kattalashtirish mumkin.</p>
        </section>
        <section aria-label="Tanlangan rekord" aria-live="polite" className="rounded-3xl border border-violet-300/20 bg-panel p-6">
          {selected ? <><p className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">{selected.title}</p><h2 className="mt-3 text-3xl font-black">{selected.name}</h2><p className="my-5 text-3xl font-black text-amber-700 dark:text-amber-300">{selected.value}</p><p className="flex items-start gap-2 text-sm text-muted"><MapPin size={17} className="shrink-0 text-violet-700 dark:text-violet-300" />{selected.location}</p><p className="mt-5 text-sm leading-7 text-muted">{selected.description}</p><button onClick={() => {setCenter(selected.coordinates);setZoom(3);}} className="mt-5 rounded-xl bg-violet-400/20 px-4 py-3 text-sm font-semibold text-violet-700 dark:text-violet-200 hover:bg-violet-400/30">Xaritada yaqinlashtirish</button><a href={selected.url} target="_blank" rel="noreferrer" className="mt-6 flex items-center gap-2 text-xs leading-5 text-cyan-700 dark:text-cyan-300 underline">{selected.source} <ExternalLink size={14} className="shrink-0" /></a>{selected.extraUrl && <a href={selected.extraUrl} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-cyan-700 dark:text-cyan-300 underline">Suv oqimi bo‘yicha manba</a>}</> : <p className="text-muted">Mos rekord topilmadi. Qidiruvni o‘zgartiring yoki boshqa kategoriya tanlang.</p>}
        </section>
      </div>
      <p className="mb-4 mt-8 text-sm text-subtle" role="status">{visible.length} ta rekord</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map(record => <button key={record.id} onClick={() => choose(record)} aria-pressed={record.id === selected?.id} className={`rounded-2xl border p-5 text-left transition hover:-translate-y-1 ${record.id === selected?.id ? 'border-violet-300 bg-violet-400/10' : 'border-line bg-panel hover:border-violet-300/50'}`}><p className="text-xs text-violet-700 dark:text-violet-300">{record.title}</p><h3 className="mt-2 text-xl font-bold">{record.name}</h3><p className="mt-3 text-2xl font-black text-amber-700 dark:text-amber-300">{record.value}</p><p className="mt-2 text-sm text-subtle">{record.location}</p></button>)}</div>
    </div>
  </main>;
}
