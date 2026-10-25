import { Orbit } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../context/settings';

const descriptions = {
  uz: 'Astronomiya va geografiyani interaktiv o‘rganish platformasi',
  en: 'An interactive platform for learning astronomy and geography',
  ru: 'Интерактивная платформа для изучения астрономии и географии',
};

export default function Footer() {
  const { pathname } = useLocation();
  const { language, mapOnly } = useSettings();
  if (pathname === '/astronomy' || mapOnly) return null;

  return <footer className="border-t border-line bg-page px-5 py-8 text-main">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
      <Link to="/" aria-label="ExploreX — bosh sahifa" className="flex items-center gap-2">
        <Orbit size={23} className="text-cyan-700 dark:text-cyan-400" />
        <span className="text-xl font-black">Explore<span className="text-cyan-700 dark:text-cyan-400">X</span></span>
      </Link>
      <p className="text-center text-sm text-subtle">{descriptions[language] || descriptions.uz}</p>
      <span className="text-xs text-subtle">© {new Date().getFullYear()} ExploreX</span>
    </div>
  </footer>;
}
