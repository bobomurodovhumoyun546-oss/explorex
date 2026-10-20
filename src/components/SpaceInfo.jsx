
import {
    X,
    Orbit,
    Ruler,
    Thermometer,
    Clock3,
    Sun,
    Sparkles,
    Info,
    CalendarDays,
} from "lucide-react";

import { spaceData } from "../data/spaceData";

export default function SpaceInfo({ selected, onClose }) {
    if (!selected) return null;

    const data = spaceData.find(
        (item) =>
            item.name.toLowerCase() === selected.name.toLowerCase()
    );

    const info = { ...selected, ...data };

    const details = [
        {
            label: "Diametri",
            value: info.diameter,
            icon: Ruler,
        },
        {
            label: "Yo'ldoshlari",
            value: info.moons,
            icon: Orbit,
        },
        {
            label: "Quyoshdan masofasi",
            value: info.distance,
            icon: Sun,
        },
        {
            label: "Harorati",
            value: info.temperature,
            icon: Thermometer,
        },
        {
            label: "Sutka davomiyligi",
            value: info.day,
            icon: Clock3,
        },
        {
            label: "Yil davomiyligi",
            value: info.year,
            icon: CalendarDays,
        },
    ].filter((item) => item.value);

    return (
        <div className="pointer-events-auto absolute bottom-24 right-4 top-44 z-30 w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-3xl border border-cyan-400/20 bg-[#080f24]/95 p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:right-6">

            {/* HEADER */}
            <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
                        <Sparkles size={15} />
                        {info.type || "Astronomik obyekt"}
                    </div>

                    <h2 className="text-3xl font-black">
                        {info.name}
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Ma'lumot panelini yopish"
                    className="rounded-xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/15"
                >
                    <X size={19} />
                </button>
            </div>

            {/* DESCRIPTION */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-cyan-300">
                    <Info size={17} />
                    Obyekt haqida
                </div>

                <p className="text-sm leading-7 text-slate-300">
                    {info.description || info.info || "Ma'lumot mavjud emas."}
                </p>
            </div>

            {/* DETAILS */}
            <div className="mb-6 grid grid-cols-2 gap-3">
                {details.map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
                    >
                        <Icon className="mb-3 text-cyan-400" size={20} />

                        <p className="mb-1 text-xs text-slate-400">
                            {label}
                        </p>

                        <p className="break-words text-sm font-bold">
                            {value}
                        </p>
                    </div>
                ))}
            </div>

            {/* FACTS */}
            {info.facts?.length > 0 && (
                <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-bold text-violet-300">
                        <Sparkles size={18} />
                        Qiziqarli faktlar
                    </h3>

                    <ul className="space-y-3 text-sm leading-6 text-slate-300">
                        {info.facts.map((fact, index) => (
                            <li key={index} className="flex gap-2">
                                <span className="text-violet-400">✦</span>
                                <span>{fact}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* FOOTER */}
            <p className="mt-5 text-center text-xs text-slate-500">
                ExploreX · Koinotni kashf et
            </p>
        </div>
    );
}
