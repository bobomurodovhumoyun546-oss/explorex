
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from "react-simple-maps";
import {
    ArrowLeft,
    Search,
    X,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Globe2,
    LoaderCircle,
} from "lucide-react";

import worldMap from "../data/worldCountries.json";
import MapViewport from "../components/MapViewport";
import WorldMapFlags from "../components/WorldMapFlags";
import CountryInfoPanel from "../components/CountryInfoPanel";
import { findMapCountry } from "../data/countryDetails";
import { countryName as displayName, capitalName, geographyQuery } from "../data/geographyLocale";
import { useSettings } from '../context/settings';

const API_URL =
    "/data/countries.json?v=geography-quality-1";
const filters = [
    { id: "all", name: "Butun jahon" },
    { id: "Asia", name: "Osiyo" },
    { id: "Europe", name: "Yevropa" },
    { id: "Americas", name: "Amerikalar" },
    { id: "Africa", name: "Afrika" },
    { id: "Oceania", name: "Okeaniya" },
];

const regionViews = {
    all: { center: [0, 10], zoom: 1 },
    Asia: { center: [85, 30], zoom: 2 },
    Europe: { center: [15, 50], zoom: 3 },
    Americas: { center: [-85, 5], zoom: 1.5 },
    Africa: { center: [20, 0], zoom: 2 },
    Oceania: { center: [145, -20], zoom: 2 },
};

export default function WorldMap() {
    const { mapOnly } = useSettings();
    const canvasRef = useRef(null);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");
    const [region, setRegion] = useState("all");
    const [zoom, setZoom] = useState(1);
    const [showFlags, setShowFlags] = useState(true);
    const [center, setCenter] = useState([0, 10]);
    const zoomIn = () => {
        setZoom((prev) => Math.min(prev * 1.6, 20));
    };

    const zoomOut = () => {
        setZoom((prev) => Math.max(prev / 1.6, 1));
    };

    useEffect(() => {
        const controller = new AbortController();

        async function loadCountries() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(API_URL, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("API ma’lumotlarini olishda xatolik.");
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("API noto‘g‘ri ma’lumot qaytardi.");
                }

                const filtered = data
                    .sort((a, b) =>
                        displayName(a).localeCompare(displayName(b), "uz")
                    );

                setCountries(filtered);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError("Davlat ma’lumotlarini yuklab bo‘lmadi. Qayta urinib ko‘ring.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadCountries();

        return () => controller.abort();
    }, [retry]);

    const filteredCountries = useMemo(() => {
        const query = geographyQuery(search);

        return countries.filter((country) => {
            const matchesRegion =
                region === "all" || country.region === region;

            const matchesSearch =
                !query ||
                geographyQuery(displayName(country)).includes(query) ||
                geographyQuery(country.name.common).includes(query) ||
                (country.capital || []).some((capital) =>
                    geographyQuery(capital).includes(query) || geographyQuery(capitalName(capital)).includes(query)
                );

            return matchesRegion && matchesSearch;
        });
    }, [countries, region, search]);

    function selectCountry(country) {
        if (!mapOnly && window.matchMedia('(max-width: 639px)').matches && canvasRef.current) {
            const navigationBottom = document.querySelector('header')?.getBoundingClientRect().bottom || 80;
            window.scrollBy({top: canvasRef.current.getBoundingClientRect().top - navigationBottom - 8, behavior:'instant'});
        }
        setSelected(country);
    }

    // A map can be clicked before the local reference data finish loading.
    // Replace that initial name-only selection as soon as its full record arrives.
    const selectedDetails = selected && (countries.find(country =>
        (selected.cca2 && country.cca2 === selected.cca2)
        || country.ccn3 === selected.ccn3
        || country.name.common === selected.name.common) || selected);

    function resetMap() {
        setZoom(1);
        setCenter([0, 10]);
        setSelected(null);
        setSearch("");
        setRegion("all");
    }

    return (
        <main className="min-h-screen bg-page px-4 pb-12 pt-28 text-main md:px-8">
            <div className="mx-auto max-w-[1600px]">
                {/* HEADER */}
                <Link
                    to="/geography"
                    className="mb-7 inline-flex items-center gap-2 text-sm text-subtle hover:text-main"
                >
                    <ArrowLeft size={17} />
                    Geografiyaga qaytish
                </Link>

                <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="mb-3 text-xs font-bold tracking-[0.25em] text-cyan-700 dark:text-cyan-400">
                            EXPLOREX GEOGRAPHY
                        </p>

                        <h1 className="text-3xl font-black md:text-5xl">
                            Dunyo{" "}
                            <span className="bg-gradient-to-r from-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                                xaritasi
                            </span>
                        </h1>

                        <p className="mt-4 text-subtle">
                            Davlatlar, poytaxtlar va geografik ma’lumotlarni
                            interaktiv o‘rganing.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4">
                        <Globe2 className="text-cyan-700 dark:text-cyan-400" size={26} />
                        <div>
                            <p className="text-2xl font-black">
                                {loading ? "..." : countries.length}
                            </p>
                            <p className="text-xs text-subtle">Davlat va hududlar</p>
                        </div>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="mb-6 rounded-3xl border border-line bg-panel p-5">
                    <div className="relative mb-5">
                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Davlat yoki poytaxtni qidiring..."
                            className="w-full rounded-xl border border-line bg-panel py-4 pl-12 pr-12 outline-none focus:border-cyan-400/50"
                        />

                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle"
                            >
                                <X size={19} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {filters.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setRegion(item.id); setCenter(regionViews[item.id].center); setZoom(regionViews[item.id].zoom); }}
                                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${region === item.id
                                        ? "bg-cyan-400 text-slate-950"
                                        : "border border-line bg-inset text-muted hover:bg-hover"
                                    }`}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="mb-6 flex items-center gap-3 text-cyan-700 dark:text-cyan-300">
                        <LoaderCircle size={20} className="animate-spin" />
                        Davlatlar yuklanmoqda...
                    </div>
                )}

                {error && (
                    <div role="alert" className="mb-6 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-700 dark:text-rose-300">
                        {error}
                        <button type="button" onClick={() => setRetry(value => value + 1)} className="ml-3 rounded-lg border border-current px-3 py-2 text-sm font-bold">Qayta urinish</button>
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
                    {/* MAP */}
                    <MapViewport className={`min-w-0 overflow-hidden rounded-3xl border border-line bg-panel ${selectedDetails ? 'country-map-selected' : ''}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
                            <div>
                                <h2 className="font-bold">Interaktiv xarita</h2>
                                <p className="mt-1 text-xs text-subtle">
                                    Davlat yoki bayroqni bosib, ma’lumotlarini ko‘ring
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <label className="mr-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={showFlags} onChange={event => setShowFlags(event.target.checked)} className="accent-cyan-400" />Bayroqlar</label>
                                <button
                                    onClick={() => setZoom((z) => Math.min(z * 1.5, 8))}
                                    className="rounded-lg bg-inset p-2 hover:bg-hover"
                                    aria-label="Yaqinlashtirish"
                                >
                                    <ZoomIn size={19} />
                                </button>

                                <button
                                    onClick={() => setZoom((z) => Math.max(z / 1.5, 1))}
                                    className="rounded-lg bg-inset p-2 hover:bg-hover"
                                    aria-label="Uzoqlashtirish"
                                >
                                    <ZoomOut size={19} />
                                </button>

                                <button
                                    onClick={resetMap}
                                    className="rounded-lg bg-inset p-2 hover:bg-hover"
                                    aria-label="Xaritani tiklash"
                                >
                                    <RotateCcw size={19} />
                                </button>
                            </div>
                        </div>

                        <div ref={canvasRef} data-map-canvas className="relative w-full overflow-hidden rounded-2xl bg-panel">

                            {/* XARITA */}
                            <ComposableMap
                                projection="geoMercator"
                                projectionConfig={{
                                    scale: 130,
                                    center: [0, 10],
                                }}
                                width={900}
                                height={520}
                                style={{
                                    width: "100%",
                                    height: "auto",
                                }}
                            >
                                <ZoomableGroup
                                    center={center}
                                    zoom={zoom}
                                    minZoom={1}
                                    maxZoom={20}
                                    onMoveEnd={({ coordinates, zoom: newZoom }) => {
                                        setCenter(coordinates);
                                        setZoom(newZoom);
                                    }}
                                >
                                    <Geographies geography={worldMap}>
                                        {({ geographies }) => <> {geographies.map(geo => {
                                            const country = findMapCountry(countries, geo);
                                            const active = selected && (country ? selected.cca2 === country.cca2 : selected.ccn3 === String(geo.id).padStart(3, '0'));
                                            const visible = !country || filteredCountries.includes(country);
                                            function choose() {
                                                selectCountry(country || { ccn3: String(geo.id).padStart(3, '0'), name: {common: geo.properties.name, official: geo.properties.name} });
                                            }
                                            return <Geography key={geo.rsmKey} geography={geo} fill={active ? '#22d3ee' : visible ? '#24425f' : '#64748b'} stroke="#94a3b8" strokeWidth={.5 / zoom} role="button" tabIndex={0} aria-label={country ? displayName(country) : geo.properties.name} onClick={choose} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();choose();} }} style={{default:{outline:'none'},hover:{fill:'#38bdf8',outline:'none',cursor:'pointer'},pressed:{fill:'#22d3ee',outline:'none'}}}><title>{country ? displayName(country) : geo.properties.name}</title></Geography>;
                                        })}{showFlags && <WorldMapFlags geographies={geographies} countries={filteredCountries} zoom={zoom} onSelect={selectCountry} displayName={displayName} />}</>}
                                    </Geographies>
                                </ZoomableGroup>
                            </ComposableMap>

                            {/* ZOOM TUGMALARI */}
                            <div data-map-controls className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">

                                <button
                                    onClick={zoomIn}
                                    disabled={zoom >= 20}
                                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-panel text-2xl font-bold text-main shadow-xl transition hover:bg-cyan-500 hover:text-slate-950 disabled:opacity-40"
                                    title="Yaqinlashtirish"
                                >
                                    +
                                </button>

                                <div className="rounded-lg bg-panel py-2 text-center text-xs font-bold text-cyan-700 dark:text-cyan-300">
                                    {zoom.toFixed(1)}x
                                </div>

                                <button
                                    onClick={zoomOut}
                                    disabled={zoom <= 1}
                                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-panel text-2xl font-bold text-main shadow-xl transition hover:bg-cyan-500 hover:text-slate-950 disabled:opacity-40"
                                    title="Uzoqlashtirish"
                                >
                                    −
                                </button>

                                <button
                                    onClick={resetMap}
                                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-panel text-main transition hover:bg-hover"
                                    title="Xaritani tiklash"
                                >
                                    <RotateCcw size={20} />
                                </button>

                            </div>
                        </div>
                        <p className="px-5 pb-5 text-center text-xs text-subtle">
                            Xaritani sichqoncha bilan suring va kattalashtiring.
                        </p>
                    </MapViewport>

                    {/* RIGHT PANEL */}
                    <div className="space-y-5">
                        <div className="rounded-3xl border border-line bg-panel p-6 text-sm leading-7 text-muted">Davlatni yoki uning bayrog‘ini bosing. Ma’lumotlar oddiy va “Butun xarita” rejimida ham ochiladi.</div>

                        {/* COUNTRY LIST */}
                        <div className="rounded-3xl border border-line bg-panel p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-bold">Davlatlar ro‘yxati</h3>
                                <span className="text-sm text-cyan-700 dark:text-cyan-400">
                                    {filteredCountries.length}
                                </span>
                            </div>

                            <div className="max-h-[380px] space-y-1 overflow-y-auto pr-1">
                                {filteredCountries.map((country) => (
                                    <button
                                        key={country.ccn3}
                                        onClick={() => selectCountry(country)}
                                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${selected?.ccn3 === country.ccn3
                                                ? "bg-cyan-400/15 text-cyan-700 dark:text-cyan-300"
                                                : "hover:bg-hover"
                                            }`}
                                    >
                                        {(country.flags?.svg || country.flags?.png) && (
                                            <img
                                                src={country.flags.svg || country.flags.png}
                                                alt=""
                                                className="h-5 w-8 object-contain"
                                            />
                                        )}

                                        <span className="text-sm font-medium">
                                            {displayName(country)}
                                        </span>
                                    </button>
                                ))}

                                {!loading && filteredCountries.length === 0 && (
                                    <p className="py-5 text-center text-sm text-subtle">
                                        Davlat topilmadi.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {selectedDetails && <CountryInfoPanel country={selectedDetails} displayName={displayName} onClose={() => setSelected(null)} />}
        </main>
    );
}
