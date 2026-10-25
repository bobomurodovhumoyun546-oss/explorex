
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useSettings } from "../context/settings";

import {
    ArrowRight,
    ArrowUpRight,
    Atom,
    BookOpen,
    ChevronDown,
    Compass,
    Earth,
    GraduationCap,
    Layers3,
    Mountain,
    Orbit,
    Rocket,
    Sparkles,
    Star,
    Telescope,
    Waves,
    MapPinned,
} from "lucide-react";

// RASMLAR
import astronomyImg from "../assets/astronomy.jpg";
import geographyImg from "../assets/geography.jpg";

// ===============================
// 3 TILDAGI MATNLAR
// ===============================

const translations = {
    uz: {
        heroBadge: "INTERAKTIV TA'LIM PLATFORMASI",
        heroTitle: "Yerdan koinotgacha — hammasini kashf et!",
        heroDescription:
            "Astronomiya va geografiyani yangi usulda o‘rganing. Sayyoralar, yulduzlar, davlatlar, materiklar va tabiat mo‘jizalarini interaktiv dunyoda kashf eting.",
        start: "Kashf etishni boshlash",
        aboutButton: "Platforma haqida",
        scroll: "PASTGA TUSHING",

        directionsBadge: "IKKI OLAM. BITTA PLATFORMA.",
        directionsTitle: "Ikki olam. Cheksiz bilim.",
        directionsDescription:
            "ExploreX sizga ikkita katta ilmiy yo‘nalishni taklif qiladi. O‘zingizga qiziq bo‘lgan olamni tanlang va sayohatni boshlang.",

        astronomy: "Astronomiya",
        astronomySubtitle: "KOINOTNI KASHF ETING",
        astronomyDescription:
            "Quyosh tizimidan chiqib, ulkan yulduzlar, uzoq galaktikalar va sirli qora tuynuklar tomon sayohat qiling.",
        astronomyTags: [
            "3D Koinot",
            "23 yulduz",
            "Sayyoralar",
            "Qora tuynuklar",
        ],

        geography: "Geografiya",
        geographySubtitle: "YERNI KASHF ETING",
        geographyDescription:
            "Yer sharini o‘rganing, materiklar, okeanlar, davlatlar, tog‘lar va tabiat mo‘jizalarini kashf eting.",
        geographyTags: [
            "3D Globus",
            "Davlatlar",
            "Okeanlar",
            "Materiklar",
        ],

        astronomySectionTitle: "Koinot sirlarini o‘rganing",
        astronomySectionDescription:
            "Quyosh tizimi va undan tashqaridagi astronomik obyektlar haqida bilim oling.",
        astronomyButton: "Astronomiyani o‘rganish",

        geographySectionTitle: "Yer sayyorasini kashf eting",
        geographySectionDescription:
            "Materiklar, okeanlar, davlatlar va geografik hodisalarni interaktiv usulda o‘rganing.",
        geographyButton: "Geografiyani o‘rganish",

        astronomyFeatures: [
            {
                title: "Quyosh tizimi",
                description:
                    "Sayyoralar va tabiiy yo‘ldoshlarni 3D fazoda o‘rganing.",
            },
            {
                title: "Yulduzlar",
                description:
                    "Sirius, UY Scuti va boshqa ulkan yulduzlarni kashf eting.",
            },
            {
                title: "Galaktikalar",
                description:
                    "Somon yo‘li, Andromeda va boshqa galaktikalarni o‘rganing.",
            },
            {
                title: "Qora tuynuklar",
                description:
                    "TON 618 va boshqa qora tuynuklar haqida bilib oling.",
            },
        ],

        geographyFeatures: [
            {
                title: "3D Yer globusi",
                description:
                    "Yer sharini aylantiring va materiklarni kashf eting.",
            },
            {
                title: "Davlatlar",
                description:
                    "Davlatlar, poytaxtlar va geografik joylashuvlarni o‘rganing.",
            },
            {
                title: "Tog‘lar va relyef",
                description:
                    "Everest, Himolay, Pomir va boshqa tog‘larni o‘rganing.",
            },
            {
                title: "Okeanlar",
                description:
                    "Okeanlar, dengizlar va suv havzalarini kashf eting.",
            },
        ],

        aboutTitle: "Bilim olishning yangi usuli",
        aboutDescription:
            "ExploreX — astronomiya va geografiyani interaktiv vizualizatsiyalar orqali o‘rganishga yordam beradigan ta’lim platformasi. Bizning maqsadimiz murakkab ilmiy tushunchalarni sodda, qiziqarli va tushunarli qilish.",
        chooseDirection: "Yo‘nalishni tanlash",
        footer: "Astronomiya va geografiyani interaktiv o‘rganish platformasi",
    },

    en: {
        heroBadge: "INTERACTIVE LEARNING PLATFORM",
        heroTitle: "From Earth to space — explore it all!",
        heroDescription:
            "Learn astronomy and geography in a new way. Discover planets, stars, countries, continents, and natural wonders through interactive experiences.",
        start: "Start exploring",
        aboutButton: "About the platform",
        scroll: "SCROLL DOWN",

        directionsBadge: "TWO WORLDS. ONE PLATFORM.",
        directionsTitle: "Two worlds. Endless knowledge.",
        directionsDescription:
            "ExploreX offers two exciting scientific fields. Choose the world that interests you and begin your journey.",

        astronomy: "Astronomy",
        astronomySubtitle: "EXPLORE THE UNIVERSE",
        astronomyDescription:
            "Travel beyond the Solar System to giant stars, distant galaxies, and mysterious black holes.",
        astronomyTags: [
            "3D Universe",
            "23 Stars",
            "Planets",
            "Black Holes",
        ],

        geography: "Geography",
        geographySubtitle: "EXPLORE THE EARTH",
        geographyDescription:
            "Explore our planet, continents, oceans, countries, mountains, and natural wonders.",
        geographyTags: [
            "3D Globe",
            "Countries",
            "Oceans",
            "Continents",
        ],

        astronomySectionTitle: "Discover the secrets of space",
        astronomySectionDescription:
            "Learn about the Solar System and astronomical objects beyond it.",
        astronomyButton: "Explore astronomy",

        geographySectionTitle: "Discover planet Earth",
        geographySectionDescription:
            "Interactively explore continents, oceans, countries, and geographical phenomena.",
        geographyButton: "Explore geography",

        astronomyFeatures: [
            {
                title: "Solar System",
                description:
                    "Explore planets and natural satellites in 3D space.",
            },
            {
                title: "Stars",
                description:
                    "Discover Sirius, UY Scuti, and other giant stars.",
            },
            {
                title: "Galaxies",
                description:
                    "Explore the Milky Way, Andromeda, and other galaxies.",
            },
            {
                title: "Black Holes",
                description:
                    "Learn about TON 618 and other black holes.",
            },
        ],

        geographyFeatures: [
            {
                title: "3D Earth Globe",
                description:
                    "Rotate the Earth and discover its continents.",
            },
            {
                title: "Countries",
                description:
                    "Learn about countries, capitals, and their locations.",
            },
            {
                title: "Mountains and Terrain",
                description:
                    "Explore Everest, the Himalayas, the Pamirs, and more.",
            },
            {
                title: "Oceans",
                description:
                    "Discover oceans, seas, and bodies of water.",
            },
        ],

        aboutTitle: "A new way to learn",
        aboutDescription:
            "ExploreX is an educational platform that helps students learn astronomy and geography through interactive visualizations. Our mission is to make complex scientific concepts simple, engaging, and understandable.",
        chooseDirection: "Choose a subject",
        footer: "An interactive platform for learning astronomy and geography",
    },

    ru: {
        heroBadge: "ИНТЕРАКТИВНАЯ ОБРАЗОВАТЕЛЬНАЯ ПЛАТФОРМА",
        heroTitle: "От Земли до космоса — открой всё!",
        heroDescription:
            "Изучайте астрономию и географию по-новому. Откройте для себя планеты, звёзды, страны, континенты и чудеса природы в интерактивном мире.",
        start: "Начать исследование",
        aboutButton: "О платформе",
        scroll: "ЛИСТАЙТЕ ВНИЗ",

        directionsBadge: "ДВА МИРА. ОДНА ПЛАТФОРМА.",
        directionsTitle: "Два мира. Бесконечные знания.",
        directionsDescription:
            "ExploreX предлагает два увлекательных научных направления. Выберите интересующую вас область и начните путешествие.",

        astronomy: "Астрономия",
        astronomySubtitle: "ИССЛЕДУЙТЕ ВСЕЛЕННУЮ",
        astronomyDescription:
            "Отправьтесь за пределы Солнечной системы к гигантским звёздам, далёким галактикам и загадочным чёрным дырам.",
        astronomyTags: [
            "3D Вселенная",
            "23 звезды",
            "Планеты",
            "Чёрные дыры",
        ],

        geography: "География",
        geographySubtitle: "ИССЛЕДУЙТЕ ЗЕМЛЮ",
        geographyDescription:
            "Изучайте Землю, континенты, океаны, страны, горы и чудеса природы.",
        geographyTags: [
            "3D Глобус",
            "Страны",
            "Океаны",
            "Континенты",
        ],

        astronomySectionTitle: "Откройте тайны космоса",
        astronomySectionDescription:
            "Узнайте о Солнечной системе и астрономических объектах за её пределами.",
        astronomyButton: "Изучать астрономию",

        geographySectionTitle: "Исследуйте планету Земля",
        geographySectionDescription:
            "Интерактивно изучайте континенты, океаны, страны и географические явления.",
        geographyButton: "Изучать географию",

        astronomyFeatures: [
            {
                title: "Солнечная система",
                description:
                    "Изучайте планеты и естественные спутники в 3D.",
            },
            {
                title: "Звёзды",
                description:
                    "Откройте Сириус, UY Scuti и другие гигантские звёзды.",
            },
            {
                title: "Галактики",
                description:
                    "Исследуйте Млечный Путь, Андромеду и другие галактики.",
            },
            {
                title: "Чёрные дыры",
                description:
                    "Узнайте о TON 618 и других чёрных дырах.",
            },
        ],

        geographyFeatures: [
            {
                title: "3D Глобус Земли",
                description:
                    "Вращайте Землю и изучайте континенты.",
            },
            {
                title: "Страны",
                description:
                    "Изучайте страны, столицы и их расположение.",
            },
            {
                title: "Горы и рельеф",
                description:
                    "Исследуйте Эверест, Гималаи, Памир и другие горы.",
            },
            {
                title: "Океаны",
                description:
                    "Откройте океаны, моря и водоёмы.",
            },
        ],

        aboutTitle: "Новый способ обучения",
        aboutDescription:
            "ExploreX — образовательная платформа для интерактивного изучения астрономии и географии. Наша цель — сделать сложные научные понятия простыми, интересными и понятными.",
        chooseDirection: "Выбрать направление",
        footer: "Интерактивная платформа для изучения астрономии и географии",
    },
};

// ===============================
// YULDUZLI FON
// ===============================

function StarsBackground({ isDark }) {
    const stars = useMemo(
        () =>
            Array.from({ length: 90 }, (_, i) => ({
                x: (i * 73.17 + 13) % 100,
                y: (i * 47.83 + 29) % 100,
                size: i % 8 === 0 ? 2.5 : 1.2,
                duration: 2 + (i % 5),
                delay: (i % 7) * 0.4,
            })),
        []
    );

    if (!isDark) return null;

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-40 top-10 h-[550px] w-[550px] rounded-full bg-cyan-600/10 blur-[130px]" />
            <div className="absolute -right-40 top-32 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[140px]" />

            {stars.map((star, i) => (
                <motion.span
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: star.size,
                        height: star.size,
                    }}
                    animate={{
                        opacity: [0.2, 0.9, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: star.duration,
                        delay: star.delay,
                        repeat: Infinity,
                    }}
                />
            ))}
        </div>
    );
}

// ===============================
// BO'LIM SARLAVHASI
// ===============================

function SectionTitle({
    badge,
    title,
    description,
    isDark,
}) {
    return (
        <div className="mx-auto mb-14 max-w-3xl text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`mb-5 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] ${isDark
                        ? "border-cyan-400/20 bg-cyan-400/5 text-cyan-300"
                        : "border-blue-200 bg-blue-50 text-blue-700"
                    }`}
            >
                <Sparkles size={14} />
                {badge}
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`text-3xl font-black tracking-tight md:text-5xl ${isDark ? "text-white" : "text-slate-900"
                    }`}
            >
                {title}
            </motion.h2>

            <p
                className={`mt-5 text-base leading-8 ${isDark ? "text-slate-400" : "text-slate-600"
                    }`}
            >
                {description}
            </p>
        </div>
    );
}

// ===============================
// MA'LUMOT KARTOCHKASI
// ===============================

function FeatureCard({
    feature,
    index,
    color,
    isDark,
}) {
    const Icon = feature.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -5 }}
            className={`group rounded-2xl border p-6 transition-all duration-300 ${isDark
                    ? "border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.06]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl"
                }`}
        >
            <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${isDark
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-slate-50"
                    }`}
                style={{ color }}
            >
                <Icon size={24} />
            </div>

            <h3
                className={`mb-2 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"
                    }`}
            >
                {feature.title}
            </h3>

            <p
                className={`text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-600"
                    }`}
            >
                {feature.description}
            </p>
        </motion.div>
    );
}

// ===============================
// ASOSIY YO'NALISH KARTOCHKASI
// ===============================

function ExploreCard({
    title,
    subtitle,
    description,
    image,
    icon: Icon,
    to,
    color,
    features,
    buttonText,
}) {
    return (
        <Link to={to} className="block h-full">
            <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.25 }}
                className="group relative flex h-full min-h-[510px] flex-col overflow-hidden rounded-[32px] border border-white/15 bg-[#0b1429] shadow-2xl"
            >
                <div className="absolute inset-0">
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#050b1c] via-[#050b1c]/65 to-[#050b1c]/15" />
                </div>

                <div className="relative z-10 flex h-full flex-1 flex-col p-7 md:p-9">
                    <div className="flex items-start justify-between">
                        <div
                            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-black/30 backdrop-blur-xl"
                            style={{ color }}
                        >
                            <Icon size={28} />
                        </div>

                        <ArrowUpRight
                            size={24}
                            className="text-white/70 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                        />
                    </div>

                    <div className="mt-auto">
                        <p
                            className="mb-3 text-xs font-bold uppercase tracking-[0.25em]"
                            style={{ color }}
                        >
                            {subtitle}
                        </p>

                        <h3 className="text-4xl font-black text-white md:text-5xl">
                            {title}
                        </h3>

                        <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                            {description}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {features.map((feature) => (
                                <span
                                    key={feature}
                                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-md"
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>

                        <div
                            className="mt-9 inline-flex items-center gap-3 rounded-xl px-5 py-3 font-bold text-slate-950"
                            style={{ backgroundColor: color }}
                        >
                            {buttonText}
                            <ArrowRight size={18} />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

// ===============================
// HOME PAGE
// ===============================

export default function Home() {
    const { language, theme } = useSettings();

    const isDark = theme === "dark";
    const text = translations[language] || translations.uz;

    const astronomyIcons = [Orbit, Star, Sparkles, Atom];
    const geographyIcons = [
        Earth,
        MapPinned,
        Mountain,
        Waves,
    ];

    const astronomyFeatures = text.astronomyFeatures.map(
        (feature, index) => ({
            ...feature,
            icon: astronomyIcons[index],
        })
    );

    const geographyFeatures = text.geographyFeatures.map(
        (feature, index) => ({
            ...feature,
            icon: geographyIcons[index],
        })
    );

    return (
        <main
            className={`min-h-screen overflow-hidden transition-colors duration-500 ${isDark
                    ? "bg-[#030712] text-white"
                    : "bg-page text-slate-900"
                }`}
        >
            {/* ================= HERO ================= */}

            <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pt-24">
                <StarsBackground isDark={isDark} />

                <div
                    className={`pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border md:h-[1000px] md:w-[1000px] ${isDark
                            ? "border-cyan-400/10"
                            : "border-slate-300/60"
                        }`}
                />

                <div
                    className={`pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full border md:h-[650px] md:w-[650px] ${isDark
                            ? "border-blue-400/10"
                            : "border-slate-300/60"
                        }`}
                />

                <div className="relative z-10 mx-auto max-w-6xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className={`mb-8 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold tracking-[0.15em] ${isDark
                                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                                : "border-blue-200 bg-blue-50 text-blue-700"
                            }`}
                    >
                        <GraduationCap size={16} />
                        {text.heroBadge}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl font-black leading-[1.08] tracking-tight sm:text-7xl lg:text-[100px]"
                    >
                        EXPLORE
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                            X
                        </span>
                    </motion.h1>

                    <motion.h2
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`mt-5 text-2xl font-bold md:text-4xl ${isDark ? "text-white" : "text-slate-900"
                            }`}
                    >
                        {text.heroTitle}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={`mx-auto mt-7 max-w-2xl text-base leading-8 md:text-lg ${isDark
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                    >
                        {text.heroDescription}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-10 flex flex-wrap justify-center gap-4"
                    >
                        <a
                            href="#directions"
                            className="inline-flex items-center gap-3 rounded-2xl bg-cyan-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
                        >
                            <Compass size={20} />
                            {text.start}
                            <ArrowRight size={18} />
                        </a>

                        <a
                            href="#about"
                            className={`inline-flex items-center gap-3 rounded-2xl border px-8 py-4 font-semibold transition ${isDark
                                    ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                                    : "border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                                }`}
                        >
                            <BookOpen size={20} />
                            {text.aboutButton}
                        </a>
                    </motion.div>

                    <motion.a
                        href="#directions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className={`mt-20 inline-flex flex-col items-center gap-2 text-xs tracking-widest ${isDark
                                ? "text-slate-500"
                                : "text-slate-600"
                            }`}
                    >
                        {text.scroll}
                        <ChevronDown
                            size={20}
                            className="animate-bounce"
                        />
                    </motion.a>
                </div>
            </section>

            {/* ================= YO'NALISHLAR ================= */}

            <section
                id="directions"
                className="relative mx-auto max-w-7xl px-5 py-24"
            >
                <SectionTitle
                    badge={text.directionsBadge}
                    title={text.directionsTitle}
                    description={text.directionsDescription}
                    isDark={isDark}
                />

                <div className="grid gap-7 lg:grid-cols-2">
                    <ExploreCard
                        title={text.astronomy}
                        subtitle={text.astronomySubtitle}
                        description={text.astronomyDescription}
                        image={astronomyImg}
                        icon={Rocket}
                        to="/astronomy"
                        color="#67e8f9"
                        features={text.astronomyTags}
                        buttonText={text.start}
                    />

                    <ExploreCard
                        title={text.geography}
                        subtitle={text.geographySubtitle}
                        description={text.geographyDescription}
                        image={geographyImg}
                        icon={Earth}
                        to="/geography"
                        color="#86efac"
                        features={text.geographyTags}
                        buttonText={text.start}
                    />
                </div>
            </section>

            {/* ================= ASTRONOMIYA ================= */}

            <section
                className={`border-y px-5 py-24 transition-colors duration-500 ${isDark
                        ? "border-white/5 bg-[#070d1d]"
                        : "border-slate-200 bg-[#eaeef2]"
                    }`}
            >
                <div className="mx-auto max-w-7xl">
                    <SectionTitle
                        badge="ASTRONOMY"
                        title={text.astronomySectionTitle}
                        description={text.astronomySectionDescription}
                        isDark={isDark}
                    />

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {astronomyFeatures.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                feature={feature}
                                index={index}
                                color={isDark ? "#67e8f9" : "#2563eb"}
                                isDark={isDark}
                            />
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <Link
                            to="/astronomy"
                            className={`inline-flex items-center gap-3 rounded-xl border px-6 py-3 font-semibold transition ${isDark
                                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
                                    : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                                }`}
                        >
                            <Telescope size={20} />
                            {text.astronomyButton}
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ================= GEOGRAFIYA ================= */}

            <section className="px-5 py-24">
                <div className="mx-auto max-w-7xl">
                    <SectionTitle
                        badge="GEOGRAPHY"
                        title={text.geographySectionTitle}
                        description={text.geographySectionDescription}
                        isDark={isDark}
                    />

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {geographyFeatures.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                feature={feature}
                                index={index}
                                color={isDark ? "#86efac" : "#15803d"}
                                isDark={isDark}
                            />
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <Link
                            to="/geography"
                            className={`inline-flex items-center gap-3 rounded-xl border px-6 py-3 font-semibold transition ${isDark
                                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                                    : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                                }`}
                        >
                            <Earth size={20} />
                            {text.geographyButton}
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ================= ABOUT ================= */}

            <section
                id="about"
                className="px-5 pb-28"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative mx-auto max-w-6xl overflow-hidden rounded-[36px] border px-7 py-20 text-center md:px-16 ${isDark
                            ? "border-cyan-400/15 bg-gradient-to-br from-[#102548] via-[#0b1731] to-[#102d2c]"
                            : "border-slate-200 bg-white shadow-xl"
                        }`}
                >
                    <div className="relative z-10">
                        <div
                            className={`mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border ${isDark
                                    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                                    : "border-blue-200 bg-blue-50 text-blue-700"
                                }`}
                        >
                            <Layers3 size={32} />
                        </div>

                        <h2
                            className={`text-3xl font-black md:text-5xl ${isDark
                                    ? "text-white"
                                    : "text-slate-900"
                                }`}
                        >
                            {text.aboutTitle}
                        </h2>

                        <p
                            className={`mx-auto mt-6 max-w-2xl text-base leading-8 ${isDark
                                    ? "text-slate-300"
                                    : "text-slate-600"
                                }`}
                        >
                            {text.aboutDescription}
                        </p>

                        <a
                            href="#directions"
                            className={`mt-9 inline-flex items-center gap-3 rounded-2xl px-8 py-4 font-bold transition ${isDark
                                    ? "bg-white text-slate-950 hover:bg-cyan-100"
                                    : "bg-slate-900 text-white hover:bg-slate-700"
                                }`}
                        >
                            <Compass size={20} />
                            {text.chooseDirection}
                            <ArrowRight size={18} />
                        </a>
                    </div>
                </motion.div>
            </section>


        </main>
    );
}
