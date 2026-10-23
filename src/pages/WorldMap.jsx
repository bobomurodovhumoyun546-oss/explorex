
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ComposableMap,
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
    Users,
    MapPin,
    Ruler,
    Languages,
    Wallet,
    LoaderCircle,
} from "lucide-react";

const API_URL =
    "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";
const regionNames = {
    Africa: "Afrika",
    Americas: "Amerikalar",
    Asia: "Osiyo",
    Europe: "Yevropa",
    Oceania: "Okeaniya",
};

const filters = [
    { id: "all", name: "Butun jahon" },
    { id: "Asia", name: "Osiyo" },
    { id: "Europe", name: "Yevropa" },
    { id: "Americas", name: "Amerikalar" },
    { id: "Africa", name: "Afrika" },
    { id: "Oceania", name: "Okeaniya" },
];

const uzbekNames = {
    Uzbekistan: "O‘zbekiston",
    Kazakhstan: "Qozog‘iston",
    Kyrgyzstan: "Qirg‘iziston",
    Tajikistan: "Tojikiston",
    Turkmenistan: "Turkmaniston",
    France: "Fransiya",
    Germany: "Germaniya",
    Italy: "Italiya",
    Spain: "Ispaniya",
    "United Kingdom": "Buyuk Britaniya",
    "United States": "AQSH",
    Russia: "Rossiya",
    China: "Xitoy",
    Japan: "Yaponiya",
    India: "Hindiston",
    Türkiye: "Turkiya",
    Turkey: "Turkiya",
    Brazil: "Braziliya",
    Canada: "Kanada",
    Australia: "Avstraliya",
    Egypt: "Misr",
    "South Africa": "Janubiy Afrika",
    "South Korea": "Janubiy Koreya",
    "North Korea": "Shimoliy Koreya",
    "New Zealand": "Yangi Zelandiya",
    "Vatican City": "Vatikan",
};

function displayName(country) {
    return uzbekNames[country.name.common] || country.name.common;
}

function formatNumber(number) {
    return typeof number === "number"
        ? new Intl.NumberFormat("uz-UZ").format(number)
        : "Ma’lumot yo‘q";
}

function Detail({ icon: Icon, label, value }) {
    return (
        <div className="flex gap-4 rounded-2xl border border-line bg-inset p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-700 dark:text-cyan-400">
                <Icon size={21} />
            </div>

            <div className="min-w-0">
                <p className="text-xs text-subtle">{label}</p>
                <p className="mt-1 break-words font-semibold">{value}</p>
            </div>
        </div>
    );
}

export default function WorldMap() {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");
    const [region, setRegion] = useState("all");
    const [zoom, setZoom] = useState(1);
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

                // 193 ta BMT a'zosi + Vatikan = 194
                const filtered = data
                    .filter(
                        (country) =>
                            country.unMember === true ||
                            country.name?.common === "Vatican City"
                    )
                    .sort((a, b) =>
                        displayName(a).localeCompare(displayName(b), "uz")
                    );

                setCountries(filtered);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Ma’lumot yuklanmadi.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadCountries();

        return () => controller.abort();
    }, []);

    const filteredCountries = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();

        return countries.filter((country) => {
            const matchesRegion =
                region === "all" || country.region === region;

            const matchesSearch =
                !query ||
                displayName(country).toLocaleLowerCase().includes(query) ||
                country.name.common.toLocaleLowerCase().includes(query) ||
                (country.capital || []).some((capital) =>
                    capital.toLocaleLowerCase().includes(query)
                );

            return matchesRegion && matchesSearch;
        });
    }, [countries, region, search]);

    function selectCountry(country) {
        setSelected(country);
    }

    function resetMap() {
        setZoom(1);
        setCenter([0, 10]);
        setSelected(null);
        setSearch("");
        setRegion("all");
    }

    const currencyText = selected
        ? Object.entries(selected.currencies || {})
            .map(([code, currency]) =>
                `${currency.name || code} (${currency.symbol || code})`
            )
            .join(", ") || "Ma’lumot yo‘q"
        : "";

    const languagesText = selected
        ? Object.values(selected.languages || {}).join(", ") ||
        "Ma’lumot yo‘q"
        : "";

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
                            <p className="text-xs text-subtle">Davlatlar</p>
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
                                onClick={() => setRegion(item.id)}
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
                    <div className="mb-6 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-700 dark:text-rose-300">
                        {error}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
                    {/* MAP */}
                    <div className="min-w-0 overflow-hidden rounded-3xl border border-line bg-panel">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
                            <div>
                                <h2 className="font-bold">Interaktiv xarita</h2>
                                <p className="mt-1 text-xs text-subtle">
                                    Davlatni bosib, ma’lumotlarini ko‘ring
                                </p>
                            </div>

                            <div className="flex gap-2">
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

                        <div className="relative w-full overflow-hidden rounded-2xl bg-panel">

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
                                    {/* ESKI Geographies KODINGNI SHU YERDA QOLDIR */}
                                </ZoomableGroup>
                            </ComposableMap>

                            {/* ZOOM TUGMALARI */}
                            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">

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
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="space-y-5">
                        {selected ? (
                            <div className="rounded-3xl border border-line bg-panel p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <span className="text-xs font-bold tracking-widest text-cyan-700 dark:text-cyan-400">
                                        DAVLAT MA’LUMOTLARI
                                    </span>

                                    <button
                                        onClick={() => setSelected(null)}
                                        className="text-subtle hover:text-main"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {selected.flags?.svg && (
                                    <img
                                        src={selected.flags.svg}
                                        alt={`${displayName(selected)} bayrog‘i`}
                                        className="mb-6 h-28 w-44 rounded-lg border border-line object-contain"
                                    />
                                )}

                                <h2 className="text-3xl font-black">
                                    {displayName(selected)}
                                </h2>

                                <p className="mt-2 text-sm text-subtle">
                                    {selected.name.official}
                                </p>

                                <div className="mt-7 space-y-3">
                                    <Detail
                                        icon={MapPin}
                                        label="Poytaxti"
                                        value={
                                            selected.capital?.join(", ") ||
                                            "Ma’lumot yo‘q"
                                        }
                                    />

                                    <Detail
                                        icon={Globe2}
                                        label="Qit’asi"
                                        value={
                                            regionNames[selected.region] ||
                                            selected.region ||
                                            "—"
                                        }
                                    />

                                    <Detail
                                        icon={Users}
                                        label="Aholisi"
                                        value={formatNumber(selected.population)}
                                    />

                                    <Detail
                                        icon={Ruler}
                                        label="Maydoni"
                                        value={`${formatNumber(selected.area)} km²`}
                                    />

                                    <Detail
                                        icon={Languages}
                                        label="Tillari"
                                        value={languagesText}
                                    />

                                    <Detail
                                        icon={Wallet}
                                        label="Valyutasi"
                                        value={currencyText}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-line bg-panel p-8 text-center">
                                <Globe2
                                    size={54}
                                    className="mx-auto text-cyan-700 dark:text-cyan-400"
                                />

                                <h2 className="mt-6 text-2xl font-bold">
                                    Davlatni tanlang
                                </h2>

                                <p className="mt-4 leading-7 text-subtle">
                                    Xaritadagi davlatni yoki pastdagi
                                    ro‘yxatdan birini tanlang.
                                </p>
                            </div>
                        )}

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
                                        {country.flags?.png && (
                                            <img
                                                src={country.flags.png}
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
        </main>
    );
}
