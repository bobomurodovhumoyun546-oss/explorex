import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Search, Telescope, X, ZoomIn, ZoomOut } from 'lucide-react';
import { filterTelescopeImages } from '../data/telescopeGallery';

function ImageViewer({ image, onClose, onPrevious, onNext, position, total }) {
  const dialogRef = useRef();
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    dialog.showModal();
    return () => { dialog.close(); if (opener instanceof HTMLElement && opener.isConnected) opener.focus(); };
  }, []);
  return <dialog ref={dialogRef} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={event => { if (event.key === 'ArrowLeft') {event.preventDefault();onPrevious();} if (event.key === 'ArrowRight') {event.preventDefault();onNext();} }} aria-labelledby="image-viewer-title" className="m-auto max-h-[95vh] w-[min(1100px,96vw)] overflow-y-auto rounded-2xl border border-line bg-panel p-0 text-main shadow-2xl backdrop:bg-black/85">
    <div className="flex items-center justify-between gap-3 border-b border-line p-4"><h2 id="image-viewer-title" className="font-bold">{image.title}</h2><button autoFocus onClick={onClose} aria-label="Suratni yopish" className="rounded-lg bg-inset p-2 hover:bg-hover"><X size={20} /></button></div>
    <div className="h-[55vh] overflow-auto bg-black"><img src={image.image} alt={`${image.title} — ${image.telescope}`} style={{width:`${zoom*100}%`,height:`${zoom*100}%`,maxWidth:'none',objectFit:'contain'}} /></div>
    <div className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="flex items-center gap-2"><button onClick={onPrevious} aria-label="Oldingi surat" className="rounded-lg bg-inset p-2"><ChevronLeft size={20} /></button><span className="text-sm text-muted">{position + 1}/{total}</span><button onClick={onNext} aria-label="Keyingi surat" className="rounded-lg bg-inset p-2"><ChevronRight size={20} /></button></div><div className="flex items-center gap-2"><button disabled={zoom === 1} onClick={() => setZoom(value => Math.max(1,value-.5))} aria-label="Suratni kichraytirish" className="rounded-lg bg-inset p-2 disabled:opacity-30"><ZoomOut size={20} /></button><span className="w-12 text-center text-xs">{zoom*100}%</span><button disabled={zoom === 3} onClick={() => setZoom(value => Math.min(3,value+.5))} aria-label="Suratni kattalashtirish" className="rounded-lg bg-inset p-2 disabled:opacity-30"><ZoomIn size={20} /></button></div></div>
    <div className="space-y-3 px-5 pb-5"><p className="text-sm text-cyan-700 dark:text-cyan-200">{image.telescope} · {image.object} · E’lon qilingan yil: {image.year}</p><p className="text-sm leading-7 text-muted">{image.description}</p><p className="text-xs text-subtle">Tasvir krediti: {image.credit}</p><a href={image.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-cyan-700 dark:text-cyan-300 underline">NASA’da asl manbani ko‘rish <ExternalLink size={15} /></a></div>
  </dialog>;
}

export default function SpaceTelescope() {
  const [telescope, setTelescope] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const images = filterTelescopeImages(telescope, query);
  const selectedIndex = images.findIndex(image => image.id === selectedId);
  const selected = images[selectedIndex];
  function move(direction) { setSelectedId(images[(selectedIndex + direction + images.length) % images.length].id); }
  return <main className="min-h-screen bg-page px-4 pb-16 pt-28 text-main sm:px-6">
    <div className="mx-auto max-w-7xl">
      <Link to="/astronomy" className="mb-7 inline-flex items-center gap-2 text-sm text-muted hover:text-main"><ArrowLeft size={17} /> Koinot xaritasiga qaytish</Link>
      <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[.25em] text-fuchsia-700 dark:text-fuchsia-300"><Telescope size={18} /> KOINOTGA YANGI NAZAR</p>
      <h1 className="text-4xl font-black sm:text-5xl">Space Telescope</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted">Webb va Hubble kosmik teleskoplari suratlari galereyasi. Suratni bosib kattalashtiring, tafsilotlari va asl manbasini ko‘ring.</p>
      <div className="my-8 flex flex-col justify-between gap-4 sm:flex-row"><div className="flex gap-2" aria-label="Teleskop filtri">{[['all','Barchasi'],['Webb','James Webb'],['Hubble','Hubble']].map(([id,label]) => <button key={id} aria-pressed={telescope === id} onClick={() => setTelescope(id)} className={`rounded-xl border px-4 py-2 text-sm font-bold ${telescope === id ? 'border-fuchsia-300 bg-fuchsia-400/20 text-fuchsia-700 dark:text-fuchsia-200' : 'border-line bg-inset hover:bg-hover'}`}>{label}</button>)}</div><label className="flex items-center gap-2 rounded-xl border border-line bg-inset px-3 py-2"><Search size={18} className="text-subtle" /><span className="sr-only">Surat qidirish</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tumanlik yoki galaktika..." className="min-w-0 bg-transparent text-sm outline-none" /></label></div>
      <p role="status" className="mb-4 text-sm text-subtle">{images.length} ta surat</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{images.map(image => <article key={image.id} className="overflow-hidden rounded-3xl border border-line bg-panel"><button onClick={() => setSelectedId(image.id)} aria-label={`${image.title} suratini ochish`} className="group block w-full overflow-hidden"><img src={image.image} alt={image.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" /></button><div className="p-5"><p className="text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300">{image.telescope} · {image.year}</p><h2 className="mb-2 mt-2 text-xl font-bold"><button onClick={() => setSelectedId(image.id)} className="text-left hover:text-fuchsia-700 dark:hover:text-fuchsia-200">{image.title}</button></h2><p className="text-sm text-subtle">{image.object}</p><p className="mt-4 text-xs leading-5 text-subtle">{image.credit}</p></div></article>)}</div>
      {!images.length && <p className="rounded-2xl border border-line bg-inset p-8 text-center text-muted">Mos surat topilmadi. Boshqa nom bilan qidiring.</p>}
      <p className="mt-8 text-xs leading-6 text-subtle">Ilmiy tasvirlarda ranglar turli to‘lqin uzunliklarini ifodalashi mumkin. Har bir suratning teleskopi va krediti alohida ko‘rsatilgan.</p>
    </div>
    {selected && <ImageViewer key={selected.id} image={selected} onClose={() => setSelectedId(null)} onPrevious={() => move(-1)} onNext={() => move(1)} position={selectedIndex} total={images.length} />}
  </main>;
}
