import {
  useEffect,
  useState,
} from "react";

import { SettingsContext } from "./settings";
import { readPreference, savePreference } from '../utils/preferences';

const translations = {
  uz: {
    home: "Bosh sahifa",
    astronomy: "Astronomiya",
    geography: "Geografiya",
    explore: "Kashf etish",
    exploreSpace: "Koinotni kashf etish",
    openMenu: "Menyuni ochish",
    closeMenu: "Menyuni yopish",
    lightMode: "Kunduzgi rejim",
    darkMode: "Tungi rejim",
  },
  en: {
    home: "Home",
    astronomy: "Astronomy",
    geography: "Geography",
    explore: "Explore",
    exploreSpace: "Explore the universe",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    lightMode: "Light mode",
    darkMode: "Dark mode",
  },
  ru: {
    home: "Главная",
    astronomy: "Астрономия",
    geography: "География",
    explore: "Исследовать",
    exploreSpace: "Исследовать космос",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    lightMode: "Светлая тема",
    darkMode: "Тёмная тема",
  },
};

export function SettingsProvider({ children }) {
  const [mapOnly, setMapOnly] = useState(false);
  const [theme, setTheme] = useState(() => {
    return readPreference("explorex-theme", ["dark", "light"], "dark");
  });

  const [language, setLanguage] = useState(() => {
    return readPreference("explorex-language", ["uz", "en", "ru"], "uz");
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );

    document.documentElement.dataset.theme = theme;

    savePreference("explorex-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    savePreference("explorex-language", language);
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        mapOnly,
        setMapOnly,
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
