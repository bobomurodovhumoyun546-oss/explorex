
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
    ArrowRight,
    CheckCircle2,
    Clock3,
    RotateCcw,
    Trophy,
    XCircle,
    ZoomIn,
    ZoomOut,
} from "lucide-react";

import worldMap from "../data/worldCountries.json";
// Natural Earth / world-atlas, bundled locally so the game needs no CDN.
const mapCountryIds = new Set(worldMap.objects.countries.geometries.map(geo => String(geo.id).padStart(3, '0')));

// Davlat IDlari — ISO 3166-1 numeric
const countries = [
    // OSIYO
    { id: "860", name: "O‘zbekiston", flag: "🇺🇿", capital: "Toshkent", region: "asia" },
    { id: "398", name: "Qozog‘iston", flag: "🇰🇿", capital: "Ostona", region: "asia" },
    { id: "417", name: "Qirg‘iziston", flag: "🇰🇬", capital: "Bishkek", region: "asia" },
    { id: "762", name: "Tojikiston", flag: "🇹🇯", capital: "Dushanbe", region: "asia" },
    { id: "795", name: "Turkmaniston", flag: "🇹🇲", capital: "Ashxobod", region: "asia" },
    { id: "156", name: "Xitoy", flag: "🇨🇳", capital: "Pekin", region: "asia" },
    { id: "392", name: "Yaponiya", flag: "🇯🇵", capital: "Tokio", region: "asia" },
    { id: "410", name: "Janubiy Koreya", flag: "🇰🇷", capital: "Seul", region: "asia" },
    { id: "408", name: "Shimoliy Koreya", flag: "🇰🇵", capital: "Pxenyan", region: "asia" },
    { id: "356", name: "Hindiston", flag: "🇮🇳", capital: "Nyu-Dehli", region: "asia" },
    { id: "586", name: "Pokiston", flag: "🇵🇰", capital: "Islomobod", region: "asia" },
    { id: "050", name: "Bangladesh", flag: "🇧🇩", capital: "Dakka", region: "asia" },
    { id: "524", name: "Nepal", flag: "🇳🇵", capital: "Katmandu", region: "asia" },
    { id: "144", name: "Shri-Lanka", flag: "🇱🇰", capital: "Shri-Jayavardenepura-Kotte", region: "asia" },
    { id: "360", name: "Indoneziya", flag: "🇮🇩", capital: "Jakarta", region: "asia" },
    { id: "458", name: "Malayziya", flag: "🇲🇾", capital: "Kuala-Lumpur", region: "asia" },
    { id: "764", name: "Tailand", flag: "🇹🇭", capital: "Bangkok", region: "asia" },
    { id: "704", name: "Vyetnam", flag: "🇻🇳", capital: "Xanoy", region: "asia" },
    { id: "608", name: "Filippin", flag: "🇵🇭", capital: "Manila", region: "asia" },
    { id: "104", name: "Myanma", flag: "🇲🇲", capital: "Neypido", region: "asia" },
    { id: "116", name: "Kambodja", flag: "🇰🇭", capital: "Pnompen", region: "asia" },
    { id: "418", name: "Laos", flag: "🇱🇦", capital: "Ventyan", region: "asia" },
    { id: "364", name: "Eron", flag: "🇮🇷", capital: "Tehron", region: "asia" },
    { id: "368", name: "Iroq", flag: "🇮🇶", capital: "Bag‘dod", region: "asia" },
    { id: "682", name: "Saudiya Arabistoni", flag: "🇸🇦", capital: "Ar-Riyod", region: "asia" },
    { id: "784", name: "BAA", flag: "🇦🇪", capital: "Abu-Dabi", region: "asia" },
    { id: "376", name: "Isroil", flag: "🇮🇱", capital: "Quddus", region: "asia" },
    { id: "400", name: "Iordaniya", flag: "🇯🇴", capital: "Amman", region: "asia" },
    { id: "760", name: "Suriya", flag: "🇸🇾", capital: "Damashq", region: "asia" },
    { id: "004", name: "Afg‘oniston", flag: "🇦🇫", capital: "Kobul", region: "asia" },

    // YEVROPA
    { id: "250", name: "Fransiya", flag: "🇫🇷", capital: "Parij", region: "europe" },
    { id: "276", name: "Germaniya", flag: "🇩🇪", capital: "Berlin", region: "europe" },
    { id: "380", name: "Italiya", flag: "🇮🇹", capital: "Rim", region: "europe" },
    { id: "724", name: "Ispaniya", flag: "🇪🇸", capital: "Madrid", region: "europe" },
    { id: "826", name: "Buyuk Britaniya", flag: "🇬🇧", capital: "London", region: "europe" },
    { id: "620", name: "Portugaliya", flag: "🇵🇹", capital: "Lissabon", region: "europe" },
    { id: "528", name: "Niderlandiya", flag: "🇳🇱", capital: "Amsterdam", region: "europe" },
    { id: "056", name: "Belgiya", flag: "🇧🇪", capital: "Bryussel", region: "europe" },
    { id: "756", name: "Shveytsariya", flag: "🇨🇭", capital: "Bern", region: "europe" },
    { id: "040", name: "Avstriya", flag: "🇦🇹", capital: "Vena", region: "europe" },
    { id: "616", name: "Polsha", flag: "🇵🇱", capital: "Varshava", region: "europe" },
    { id: "203", name: "Chexiya", flag: "🇨🇿", capital: "Praga", region: "europe" },
    { id: "703", name: "Slovakiya", flag: "🇸🇰", capital: "Bratislava", region: "europe" },
    { id: "348", name: "Vengriya", flag: "🇭🇺", capital: "Budapesht", region: "europe" },
    { id: "642", name: "Ruminiya", flag: "🇷🇴", capital: "Buxarest", region: "europe" },
    { id: "100", name: "Bolgariya", flag: "🇧🇬", capital: "Sofiya", region: "europe" },
    { id: "300", name: "Gretsiya", flag: "🇬🇷", capital: "Afina", region: "europe" },
    { id: "752", name: "Shvetsiya", flag: "🇸🇪", capital: "Stokgolm", region: "europe" },
    { id: "578", name: "Norvegiya", flag: "🇳🇴", capital: "Oslo", region: "europe" },
    { id: "246", name: "Finlandiya", flag: "🇫🇮", capital: "Xelsinki", region: "europe" },
    { id: "208", name: "Daniya", flag: "🇩🇰", capital: "Kopengagen", region: "europe" },
    { id: "372", name: "Irlandiya", flag: "🇮🇪", capital: "Dublin", region: "europe" },
    { id: "804", name: "Ukraina", flag: "🇺🇦", capital: "Kiyev", region: "europe" },
    { id: "112", name: "Belarus", flag: "🇧🇾", capital: "Minsk", region: "europe" },
    { id: "191", name: "Xorvatiya", flag: "🇭🇷", capital: "Zagreb", region: "europe" },
    { id: "688", name: "Serbiya", flag: "🇷🇸", capital: "Belgrad", region: "europe" },
    { id: "705", name: "Sloveniya", flag: "🇸🇮", capital: "Lyublyana", region: "europe" },
    { id: "008", name: "Albaniya", flag: "🇦🇱", capital: "Tirana", region: "europe" },
    { id: "233", name: "Estoniya", flag: "🇪🇪", capital: "Tallin", region: "europe" },
    { id: "428", name: "Latviya", flag: "🇱🇻", capital: "Riga", region: "europe" },
    { id: "440", name: "Litva", flag: "🇱🇹", capital: "Vilnyus", region: "europe" },

    // AMERIKALAR
    { id: "840", name: "AQSH", flag: "🇺🇸", capital: "Vashington", region: "americas" },
    { id: "124", name: "Kanada", flag: "🇨🇦", capital: "Ottava", region: "americas" },
    { id: "484", name: "Meksika", flag: "🇲🇽", capital: "Mexiko", region: "americas" },
    { id: "076", name: "Braziliya", flag: "🇧🇷", capital: "Brazilia", region: "americas" },
    { id: "032", name: "Argentina", flag: "🇦🇷", capital: "Buenos-Ayres", region: "americas" },
    { id: "152", name: "Chili", flag: "🇨🇱", capital: "Santyago", region: "americas" },
    { id: "604", name: "Peru", flag: "🇵🇪", capital: "Lima", region: "americas" },
    { id: "170", name: "Kolumbiya", flag: "🇨🇴", capital: "Bogota", region: "americas" },
    { id: "862", name: "Venesuela", flag: "🇻🇪", capital: "Karakas", region: "americas" },
    { id: "218", name: "Ekvador", flag: "🇪🇨", capital: "Kito", region: "americas" },
    { id: "068", name: "Boliviya", flag: "🇧🇴", capital: "Sukre", region: "americas" },
    { id: "600", name: "Paragvay", flag: "🇵🇾", capital: "Asunson", region: "americas" },
    { id: "858", name: "Urugvay", flag: "🇺🇾", capital: "Montevideo", region: "americas" },
    { id: "192", name: "Kuba", flag: "🇨🇺", capital: "Gavana", region: "americas" },
    { id: "214", name: "Dominikan Respublikasi", flag: "🇩🇴", capital: "Santo-Domingo", region: "americas" },
    { id: "332", name: "Gaiti", flag: "🇭🇹", capital: "Port-o-Prens", region: "americas" },
    { id: "320", name: "Gvatemala", flag: "🇬🇹", capital: "Gvatemala", region: "americas" },
    { id: "188", name: "Kosta-Rika", flag: "🇨🇷", capital: "San-Xose", region: "americas" },
    { id: "591", name: "Panama", flag: "🇵🇦", capital: "Panama", region: "americas" },
    { id: "340", name: "Gonduras", flag: "🇭🇳", capital: "Tegusigalpa", region: "americas" },
    { id: "558", name: "Nikaragua", flag: "🇳🇮", capital: "Managua", region: "americas" },
    { id: "222", name: "Salvador", flag: "🇸🇻", capital: "San-Salvador", region: "americas" },

    // AFRIKA
    { id: "818", name: "Misr", flag: "🇪🇬", capital: "Qohira", region: "africa" },
    { id: "012", name: "Jazoir", flag: "🇩🇿", capital: "Jazoir", region: "africa" },
    { id: "504", name: "Marokash", flag: "🇲🇦", capital: "Rabot", region: "africa" },
    { id: "788", name: "Tunis", flag: "🇹🇳", capital: "Tunis", region: "africa" },
    { id: "434", name: "Liviya", flag: "🇱🇾", capital: "Tripoli", region: "africa" },
    { id: "729", name: "Sudan", flag: "🇸🇩", capital: "Xartum", region: "africa" },
    { id: "231", name: "Efiopiya", flag: "🇪🇹", capital: "Addis-Abeba", region: "africa" },
    { id: "404", name: "Keniya", flag: "🇰🇪", capital: "Nayrobi", region: "africa" },
    { id: "834", name: "Tanzaniya", flag: "🇹🇿", capital: "Dodoma", region: "africa" },
    { id: "800", name: "Uganda", flag: "🇺🇬", capital: "Kampala", region: "africa" },
    { id: "566", name: "Nigeriya", flag: "🇳🇬", capital: "Abuja", region: "africa" },
    { id: "288", name: "Gana", flag: "🇬🇭", capital: "Akkra", region: "africa" },
    { id: "384", name: "Kot-d’Ivuar", flag: "🇨🇮", capital: "Yamusukro", region: "africa" },
    { id: "686", name: "Senegal", flag: "🇸🇳", capital: "Dakar", region: "africa" },
    { id: "466", name: "Mali", flag: "🇲🇱", capital: "Bamako", region: "africa" },
    { id: "562", name: "Niger", flag: "🇳🇪", capital: "Niamey", region: "africa" },
    { id: "148", name: "Chad", flag: "🇹🇩", capital: "Njamena", region: "africa" },
    { id: "120", name: "Kamerun", flag: "🇨🇲", capital: "Yaunde", region: "africa" },
    { id: "180", name: "Kongo DR", flag: "🇨🇩", capital: "Kinshasa", region: "africa" },
    { id: "178", name: "Kongo Respublikasi", flag: "🇨🇬", capital: "Brazzavil", region: "africa" },
    { id: "024", name: "Angola", flag: "🇦🇴", capital: "Luanda", region: "africa" },
    { id: "894", name: "Zambiya", flag: "🇿🇲", capital: "Lusaka", region: "africa" },
    { id: "716", name: "Zimbabve", flag: "🇿🇼", capital: "Xarare", region: "africa" },
    { id: "508", name: "Mozambik", flag: "🇲🇿", capital: "Maputu", region: "africa" },
    { id: "710", name: "Janubiy Afrika", flag: "🇿🇦", capital: "Pretoriya", region: "africa" },
    { id: "516", name: "Namibiya", flag: "🇳🇦", capital: "Vindxuk", region: "africa" },
    { id: "072", name: "Botsvana", flag: "🇧🇼", capital: "Gaborone", region: "africa" },
    { id: "450", name: "Madagaskar", flag: "🇲🇬", capital: "Antananarivu", region: "africa" },

    // OKEANIYA
    { id: "036", name: "Avstraliya", flag: "🇦🇺", capital: "Kanberra", region: "oceania" },
    { id: "554", name: "Yangi Zelandiya", flag: "🇳🇿", capital: "Vellington", region: "oceania" },
    { id: "598", name: "Papua-Yangi Gvineya", flag: "🇵🇬", capital: "Port-Morsbi", region: "oceania" },
    { id: "242", name: "Fiji", flag: "🇫🇯", capital: "Suva", region: "oceania" },
    { id: "090", name: "Solomon orollari", flag: "🇸🇧", capital: "Xoniara", region: "oceania" },
    { id: "548", name: "Vanuatu", flag: "🇻🇺", capital: "Port-Vila", region: "oceania" },
    { id: "882", name: "Samoa", flag: "🇼🇸", capital: "Apia", region: "oceania" },
    { id: "776", name: "Tonga", flag: "🇹🇴", capital: "Nukualofa", region: "oceania" },
    { id: "296", name: "Kiribati", flag: "🇰🇮", capital: "Janubiy Tarava", region: "oceania" },
    { id: "520", name: "Nauru", flag: "🇳🇷", capital: "Yaren (ma’muriy markaz)", region: "oceania" },
    { id: "798", name: "Tuvalu", flag: "🇹🇻", capital: "Funafuti", region: "oceania" },
    { id: "584", name: "Marshall orollari", flag: "🇲🇭", capital: "Majuro", region: "oceania" },
    { id: "583", name: "Mikroneziya", flag: "🇫🇲", capital: "Palikir", region: "oceania" },
    { id: "585", name: "Palau", flag: "🇵🇼", capital: "Ngerulmud", region: "oceania" },
];

const regions = [
    { id: "asia", name: "Osiyo", emoji: "🌏", description: "Osiyo davlatlarini toping" },
    { id: "europe", name: "Yevropa", emoji: "🌍", description: "Yevropa davlatlarini toping" },
    { id: "americas", name: "Amerikalar", emoji: "🌎", description: "Shimoliy va Janubiy Amerika" },
    { id: "africa", name: "Afrika", emoji: "🌍", description: "Afrika davlatlarini toping" },
    { id: "oceania", name: "Okeaniya", emoji: "🏝️", description: "Okeaniya davlatlarini toping" },
    { id: "world", name: "Butun jahon", emoji: "🌐", description: "Barcha hududlardan savollar" },
];

const regionViews = {
    asia: { center: [90, 35], zoom: 2 },
    europe: { center: [15, 52], zoom: 3.1 },
    americas: { center: [-85, 5], zoom: 1.45 },
    africa: { center: [20, 0], zoom: 2 },
    oceania: { center: [145, -20], zoom: 2.1 },
    world: { center: [0, 10], zoom: 1 },
};

function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export default function GeographyChallenge() {
    const [stage, setStage] = useState("region");
    const [region, setRegion] = useState(null);
    const [count, setCount] = useState(10);
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [answer, setAnswer] = useState(null);
    const [wrongIds, setWrongIds] = useState([]);
    const [center, setCenter] = useState([0, 10]);
    const [zoom, setZoom] = useState(1);

    const deadlineRef = useRef(0);
    const answerLockedRef = useRef(false);
    const startedAtRef = useRef(0);
    const [elapsed, setElapsed] = useState(0);
    const current = questions[index];

    const regionInfo = regions.find((r) => r.id === region);

    const availableCountries = useMemo(() => {
        return countries.filter(c => mapCountryIds.has(c.id) && (region === 'world' || c.region === region));
    }, [region]);

    // Absolute deadline: switching tabs cannot grant extra answer time.
    useEffect(() => {
        if (stage !== 'game' || answer || !current) return;
        const timer = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0 && !answerLockedRef.current) {
                answerLockedRef.current = true;
                setAnswer({ correct: false, timeout: true });
            }
        }, 100);
        return () => clearInterval(timer);
    }, [stage, answer, current]);

    function chooseRegion(id) {
        setRegion(id);
        setStage("count");
    }

    function startGame(questionCount) {
        const pool = availableCountries;
        if (pool.length < questionCount) return;

        const selected = shuffle(pool).slice(0, questionCount);

        // These handlers run on clicks; the compiler treats nested map/render-prop callbacks as render paths.
        // eslint-disable-next-line react-hooks/purity
        const now = Date.now();
        deadlineRef.current = now + 30000;
        startedAtRef.current = now;
        answerLockedRef.current = false;
        setElapsed(0);
        setCount(questionCount);
        setQuestions(selected);
        setIndex(0);
        setScore(0);
        setTimeLeft(30);
        setAnswer(null);
        setWrongIds([]);
        setStage("game");

        const view = regionViews[region];
        setCenter(view.center);
        setZoom(view.zoom);
    }

    function handleCountryClick(geo) {
        if (stage !== "game" || answerLockedRef.current || !current) return;
        // Called only by geography click/keyboard handlers, never while rendering.
        // eslint-disable-next-line react-hooks/purity
        const now = Date.now();
        if (now >= deadlineRef.current) {
            answerLockedRef.current = true;
            setTimeLeft(0);
            setAnswer({ correct: false, timeout: true });
            return;
        }

        const selectedId = String(geo.id).padStart(3, "0");

        if (selectedId === current.id) {
            answerLockedRef.current = true;
            setScore((s) => s + 1);
            setAnswer({ correct: true, timeout: false });
        } else {
            setWrongIds((previous) =>
                previous.includes(selectedId)
                    ? previous
                    : [...previous, selectedId]
            );
        }
    }

    function nextQuestion() {
        if (!answer) return;
        if (index + 1 >= questions.length) {
            setElapsed(Math.round((Date.now() - startedAtRef.current) / 1000));
            setStage("result");
            return;
        }

        deadlineRef.current = Date.now() + 30000;
        answerLockedRef.current = false;
        setIndex((i) => i + 1);
        setTimeLeft(30);
        setAnswer(null);
        setWrongIds([]);
    }

    function restart() {
        startGame(count);
    }

    function reset() {
        setStage("region");
        setRegion(null);
        setQuestions([]);
        setAnswer(null);
        setWrongIds([]);
    }

    return (
        <main className="min-h-screen bg-page px-4 pb-12 pt-28 text-main md:px-8">
            <div className="mx-auto max-w-7xl">
                <Link
                    to="/geography"
                    className="mb-7 inline-flex items-center gap-2 text-sm text-subtle transition hover:text-main"
                >
                    <ArrowLeft size={17} />
                    Geografiyaga qaytish
                </Link>

                <div className="mb-9">
                    <p className="mb-2 text-xs font-bold tracking-[0.3em] text-emerald-700 dark:text-emerald-400">
                        EXPLOREX GEOGRAPHY
                    </p>

                    <h1 className="text-3xl font-black md:text-5xl">
                        Davlatni <span className="text-emerald-700 dark:text-emerald-400">top!</span>
                    </h1>

                    <p className="mt-4 text-subtle">
                        Davlatlarni xaritadan toping va bilimingizni sinang!
                    </p>
                </div>

                {/* 1. HUDUD TANLASH */}
                {stage === "region" && (
                    <div>
                        <h2 className="mb-7 text-2xl font-bold">
                            Hududni tanlang
                        </h2>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {regions.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => chooseRegion(item.id)}
                                    className="group rounded-3xl border border-line bg-panel p-8 text-left transition hover:-translate-y-1 hover:border-emerald-400/50 hover:bg-hover"
                                >
                                    <div className="mb-7 text-5xl">
                                        {item.emoji}
                                    </div>

                                    <h3 className="text-2xl font-bold">
                                        {item.name}
                                    </h3>

                                    <p className="mt-3 text-sm text-subtle">
                                        {item.description}
                                    </p>

                                    <span className="mt-7 inline-flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
                                        Tanlash
                                        <ArrowRight size={18} />
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. SAVOLLAR SONI */}
                {stage === "count" && (
                    <div className="mx-auto max-w-3xl">
                        <button
                            onClick={() => setStage("region")}
                            className="mb-7 text-sm text-subtle hover:text-main"
                        >
                            ← Hududlarga qaytish
                        </button>

                        <div className="mb-9 text-center">
                            <div className="text-6xl">
                                {regionInfo?.emoji}
                            </div>

                            <h2 className="mt-5 text-3xl font-black">
                                {regionInfo?.name}
                            </h2>

                            <p className="mt-3 text-subtle">
                                Savollar sonini tanlang
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {[5, 10, 20].map((number) => {
                                const disabled = availableCountries.length < number;

                                return (
                                    <button
                                        key={number}
                                        disabled={disabled}
                                        onClick={() => startGame(number)}
                                        className="rounded-3xl border border-line bg-panel p-9 text-left transition hover:border-emerald-400/50 hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Trophy
                                            size={35}
                                            className="text-emerald-700 dark:text-emerald-400"
                                        />

                                        <h3 className="mt-7 text-4xl font-black">
                                            {number} ta
                                        </h3>

                                        <p className="mt-3 text-subtle">
                                            Tasodifiy savollar
                                        </p>

                                        <p className="mt-5 text-sm text-emerald-700 dark:text-emerald-300">
                                            Har bir savolga 30 soniya
                                        </p>

                                        {disabled && (
                                            <p className="mt-3 text-xs text-rose-700 dark:text-rose-300">
                                                Bu hududda yetarli davlat yo‘q
                                            </p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. O‘YIN */}
                {stage === "game" && current && (
                    <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
                        {/* XARITA */}
                        <div className="overflow-hidden rounded-3xl border border-line bg-panel">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                                <div>
                                    <h2 className="font-bold">
                                        {regionInfo?.name} xaritasi
                                    </h2>

                                    <p className="mt-1 text-xs text-subtle">
                                        Davlatni xaritadan bosing
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
                                </div>
                            </div>

                            <ComposableMap
                                projection="geoMercator"
                                projectionConfig={{
                                    scale: 130,
                                    center: [0, 10],
                                }}
                                width={900}
                                height={530}
                                style={{
                                    width: "100%",
                                    height: "auto",
                                }}
                            >
                                <ZoomableGroup
                                    center={center}
                                    zoom={zoom}
                                    minZoom={1}
                                    maxZoom={8}
                                    onMoveEnd={({ coordinates, zoom: nextZoom }) => {
                                        setCenter(coordinates);
                                        setZoom(nextZoom);
                                    }}
                                >
                                    <Geographies geography={worldMap}>
                                        {({ geographies }) =>
                                            geographies.map((geo) => {
                                                const id = String(geo.id).padStart(3, "0");

                                                const isCorrect =
                                                    answer && id === current.id;

                                                const isWrong = wrongIds.includes(id);

                                                let fill = "#24425f";

                                                if (isWrong) fill = "#fb7185";
                                                if (isCorrect) fill = "#34d399";

                                                return (
                                                    <Geography
                                                        key={geo.rsmKey}
                                                        geography={geo}
                                                        onClick={() => handleCountryClick(geo)}
                                                        tabIndex={0}
                                                        role="button"
                                                        aria-label={geo.properties.name}
                                                        onKeyDown={event => {
                                                            if (event.key === 'Enter' || event.key === ' ') {
                                                                event.preventDefault();
                                                                handleCountryClick(geo);
                                                            }
                                                        }}
                                                        fill={fill}
                                                        stroke="#081525"
                                                        strokeWidth={0.6 / zoom}
                                                        style={{
                                                            default: {
                                                                outline: "none",
                                                                cursor: answer ? "default" : "pointer",
                                                            },
                                                            hover: {
                                                                fill: isCorrect
                                                                    ? "#34d399"
                                                                    : isWrong
                                                                        ? "#fb7185"
                                                                        : answer
                                                                            ? fill
                                                                            : "#38bdf8",
                                                                outline: "none",
                                                                cursor: answer ? "default" : "pointer",
                                                            },
                                                            pressed: {
                                                                outline: "none",
                                                            },
                                                        }}
                                                    />
                                                );
                                            })
                                        }
                                    </Geographies>
                                </ZoomableGroup>
                            </ComposableMap>

                            <p className="px-5 pb-5 text-center text-xs text-subtle">
                                Xaritani surish va kattalashtirish mumkin.
                            </p>
                        </div>

                        {/* SAVOL PANELI */}
                        <div className="flex flex-col rounded-3xl border border-line bg-panel p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold tracking-widest text-emerald-700 dark:text-emerald-400">
                                    SAVOL {index + 1}
                                </span>

                                <span className="text-sm text-subtle">
                                    {index + 1}/{questions.length}
                                </span>
                            </div>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-inset">
                                <div
                                    className="h-full rounded-full bg-emerald-400 transition-all"
                                    style={{
                                        width: `${((index + 1) / questions.length) * 100}%`,
                                    }}
                                />
                            </div>

                            {/* TAYMER */}
                            <div
                                className={`mt-8 flex items-center justify-between rounded-2xl border p-4 ${timeLeft <= 10
                                        ? "border-rose-400/30 bg-rose-400/10"
                                        : "border-cyan-400/20 bg-cyan-400/5"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Clock3
                                        size={21}
                                        className={
                                            timeLeft <= 10
                                                ? "text-rose-700 dark:text-rose-400"
                                                : "text-cyan-700 dark:text-cyan-400"
                                        }
                                    />
                                    <span className="text-sm font-semibold">
                                        Qolgan vaqt
                                    </span>
                                </div>

                                <span
                                    className={`text-3xl font-black ${timeLeft <= 10
                                            ? "text-rose-700 dark:text-rose-400"
                                            : "text-main"
                                        }`}
                                >
                                    00:{String(timeLeft).padStart(2, "0")}
                                </span>
                            </div>

                            {/* SAVOL */}
                            <div className="mt-9">
                                <p className="text-sm text-subtle">
                                    Xaritadan ushbu davlatni toping:
                                </p>

                                <h2 className="mt-4 text-3xl font-black leading-tight">
                                    {current.name}
                                </h2>

                                <p className="mt-4 text-sm leading-6 text-subtle">
                                    Davlat joylashgan hududni bosing.
                                </p>
                            </div>

                            {/* NATIJA */}
                            {answer && (
                                <div
                                    className={`mt-8 rounded-2xl border p-5 ${answer.correct
                                            ? "border-emerald-400/30 bg-emerald-400/10"
                                            : "border-rose-400/30 bg-rose-400/10"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {answer.correct ? (
                                            <CheckCircle2
                                                size={22}
                                                className="text-emerald-700 dark:text-emerald-400"
                                            />
                                        ) : (
                                            <XCircle
                                                size={22}
                                                className="text-rose-700 dark:text-rose-400"
                                            />
                                        )}

                                        <span className="font-bold">
                                            {answer.correct
                                                ? "To‘g‘ri topdingiz!"
                                                : "Vaqt tugadi!"}
                                        </span>
                                    </div>

                                    <div className="mt-5 flex items-center gap-4">
                                        <span className="text-6xl">
                                            {current.flag}
                                        </span>

                                        <div>
                                            <p className="text-lg font-bold">
                                                {current.name}
                                            </p>

                                            <p className="mt-1 text-sm text-muted">
                                                Poytaxti: {current.capital}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto pt-8">
                                <div className="mb-5 flex items-center justify-between rounded-xl bg-inset px-4 py-3">
                                    <span className="text-sm text-subtle">
                                        To‘plangan ball
                                    </span>
                                    <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                                        {score}
                                    </span>
                                </div>

                                {answer && (
                                    <button
                                        onClick={nextQuestion}
                                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-400 px-5 py-4 font-bold text-slate-950 transition hover:bg-emerald-300"
                                    >
                                        {index + 1 === questions.length
                                            ? "Natijani ko‘rish"
                                            : "Keyingi savol"}
                                        <ArrowRight size={19} />
                                    </button>
                                )}

                                <button
                                    onClick={reset}
                                    className="mt-5 w-full text-sm text-subtle hover:text-main"
                                >
                                    Challenge'dan chiqish
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. YAKUNIY NATIJA */}
                {stage === "result" && (
                    <div className="mx-auto max-w-xl rounded-3xl border border-line bg-panel p-9 text-center">
                        <Trophy
                            size={70}
                            className="mx-auto text-yellow-700 dark:text-yellow-400"
                        />

                        <h2 className="mt-7 text-3xl font-black">
                            Challenge yakunlandi!
                        </h2>

                        <p className="mt-4 text-subtle">
                            {regionInfo?.name} — {count} ta savol · {elapsed} soniya
                        </p>

                        <div className="mt-8 text-6xl font-black text-emerald-700 dark:text-emerald-400">
                            {score}/{questions.length}
                        </div>

                        <p className="mt-5 text-lg text-muted">
                            To‘g‘ri javoblar:{" "}
                            {Math.round((score / questions.length) * 100)}%
                        </p>

                        <div className="mt-9 flex flex-col gap-3">
                            <button
                                onClick={restart}
                                className="inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-400 px-6 py-4 font-bold text-slate-950 hover:bg-emerald-300"
                            >
                                <RotateCcw size={19} />
                                Qayta o‘ynash
                            </button>

                            <button
                                onClick={reset}
                                className="rounded-xl border border-line px-6 py-4 font-semibold hover:bg-hover"
                            >
                                Boshqa hududni tanlash
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
