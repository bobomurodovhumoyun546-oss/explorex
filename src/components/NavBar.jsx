import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
    Orbit,
    Globe,
    Home,
    Menu,
    X,
    ArrowUpRight,
    Sparkles,
    Sun,
    Moon,
    Languages,
} from "lucide-react";

import { useSettings } from "../context/SettingsContext";

// Logo faylingni src/assets/logo.jpg manzilida qoldir
import logo from "../assets/logo.jpg";
import logo2 from "../assets/logo2.jpg"

const links = [
    { key: "home", path: "/", icon: Home },
    { key: "astronomy", path: "/astronomy", icon: Orbit },
    { key: "geography", path: "/geography", icon: Globe2 },
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const {
        theme,
        toggleTheme,
        language,
        setLanguage,
        t,
    } = useSettings();

    const isDark = theme === "dark";

    const navStyle = isDark
        ? "border-white/10 bg-[#080e20]/95 text-white"
        : "border-slate-200 bg-white/95 text-slate-900";

    const inactiveStyle = isDark
        ? "text-slate-300 hover:bg-white/10 hover:text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950";

    const activeStyle = isDark
        ? "bg-cyan-400/10 text-cyan-300"
        : "bg-blue-50 text-blue-700";

    const controlStyle = isDark
        ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
        : "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200";

    return (
        <header className="fixed left-0 top-0 z-50 w-full px-3 pt-3 sm:px-6">

            <nav
                className={`
          mx-auto flex max-w-7xl items-center
          justify-between gap-3 rounded-2xl
          border px-4 py-3 shadow-xl
          backdrop-blur-xl transition-colors
          duration-300
          ${navStyle}
        `}
            >
                {/* LOGO */}

                <NavLink
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex shrink-0 items-center"
                >
                    <img
                        src={theme === "dark" ? logo2 : logo}
                        alt="ExploreX"
                        className="h-12 w-auto max-w-[160px] object-contain sm:h-14 sm:max-w-[200px]"
                    />
                </NavLink>


                {/* DESKTOP MENU */}
                <div
                    className={`
            hidden items-center gap-1 rounded-xl
            border p-1 lg:flex
            ${isDark
                            ? "border-white/5 bg-white/[0.04]"
                            : "border-slate-200 bg-slate-50"
                        }
          `}
                >
                    {links.map(({ key, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === "/"}
                            className={({ isActive }) =>
                                `
                  flex items-center gap-2 rounded-lg
                  px-3 py-2.5 text-sm font-medium
                  transition-colors
                  ${isActive ? activeStyle : inactiveStyle}
                `
                            }
                        >
                            <Icon size={17} />
                            {t(key)}
                        </NavLink>
                    ))}
                </div>

                {/* RIGHT CONTROLS */}
                <div className="flex items-center gap-2">

                    {/* LANGUAGE SELECT */}
                    <div
                        className={`
              flex items-center gap-1 rounded-xl
              border px-2 py-2
              ${controlStyle}
            `}
                    >
                        <Languages size={17} />

                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            aria-label="Tilni tanlash"
                            className={`
                cursor-pointer bg-transparent
                text-xs font-bold outline-none
                ${isDark ? "text-white" : "text-slate-900"}
              `}
                        >
                            <option value="uz" className="text-black">
                                UZ
                            </option>

                            <option value="en" className="text-black">
                                EN
                            </option>

                            <option value="ru" className="text-black">
                                RU
                            </option>
                        </select>
                    </div>

                    {/* THEME BUTTON */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={isDark ? t("lightMode") : t("darkMode")}
                        aria-label={isDark ? t("lightMode") : t("darkMode")}
                        className={`
              flex h-10 w-10 items-center
              justify-center rounded-xl border
              transition-colors
              ${controlStyle}
            `}
                    >
                        {isDark ? (
                            <Sun size={20} />
                        ) : (
                            <Moon size={20} />
                        )}
                    </button>

                    {/* EXPLORE BUTTON */}
                    <NavLink
                        to="/astronomy"
                        className="
              hidden items-center gap-2
              rounded-xl bg-cyan-400 px-4 py-2.5
              text-sm font-bold text-slate-950
              transition-colors hover:bg-cyan-300
              xl:flex
            "
                    >
                        <Sparkles size={17} />
                        {t("explore")}
                        <ArrowUpRight size={16} />
                    </NavLink>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
                        aria-expanded={menuOpen}
                        className={`
              rounded-xl border p-2
              lg:hidden
              ${controlStyle}
            `}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                </div>
            </nav>

            {/* MOBILE MENU */}
            {menuOpen && (
                <div
                    className={`
            mx-auto mt-2 max-w-7xl
            rounded-2xl border p-3 shadow-2xl
            backdrop-blur-xl lg:hidden
            ${navStyle}
          `}
                >
                    {links.map(({ key, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === "/"}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `
                  mb-1 flex items-center gap-3
                  rounded-xl px-4 py-3
                  text-sm font-semibold
                  ${isActive ? activeStyle : inactiveStyle}
                `
                            }
                        >
                            <Icon size={19} />
                            {t(key)}
                        </NavLink>
                    ))}

                    <NavLink
                        to="/astronomy"
                        onClick={() => setMenuOpen(false)}
                        className="
              mt-3 flex items-center justify-center
              gap-2 rounded-xl bg-cyan-400
              px-4 py-3 font-bold text-slate-950
            "
                    >
                        <Sparkles size={18} />
                        {t("exploreSpace")}
                        <ArrowUpRight size={17} />
                    </NavLink>
                </div>
            )}
        </header>
    );
}