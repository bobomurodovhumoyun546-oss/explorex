import { useEffect, useRef } from 'react';
import { Eye, Maximize } from 'lucide-react';
import { useSettings } from '../context/settings';

export default function MapViewport({ children, className = '', overlay, ...props }) {
  const { mapOnly, setMapOnly } = useSettings();
  const buttonRef = useRef(null);

  useEffect(() => () => setMapOnly(false), [setMapOnly]);

  useEffect(() => {
    if (!mapOnly) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    buttonRef.current?.focus();
    function escape(event) {
      if (event.key === 'Escape') setMapOnly(false);
    }
    window.addEventListener('keydown', escape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', escape);
    };
  }, [mapOnly, setMapOnly]);

  return <section {...props} className={`map-viewport ${mapOnly ? 'map-viewport-expanded' : ''} ${className}`}>
    <div data-map-toggle className="flex justify-end p-3">
      <button ref={buttonRef} type="button" onClick={() => setMapOnly(value => !value)} aria-pressed={mapOnly} title={mapOnly ? 'Orqaga (Esc)' : 'Butun xarita'} className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2 text-sm font-bold text-main shadow-sm">
        {mapOnly ? <Eye size={18} /> : <Maximize size={18} />}
        {mapOnly ? 'Orqaga' : 'Butun xarita'}
      </button>
    </div>
    {children}
    {mapOnly && overlay && <div data-map-overlay className="map-game-overlay">{overlay}</div>}
  </section>;
}
