import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Astronomy = lazy(() => import('./pages/Astronomy'));
const Geography = lazy(() => import('./pages/Geography'));
const GeographyChallenge = lazy(() => import('./pages/GeographyChallenge'));
const FlagQuiz = lazy(() => import('./pages/FlagQuiz'));
const EarthRecords = lazy(() => import('./pages/EarthRecords'));
const WorldMap = lazy(() => import('./pages/WorldMap'));
const SpaceTelescope = lazy(() => import('./pages/SpaceTelescope'));
const TimeAtlas = lazy(() => import('./pages/TimeAtlas'));

import Navbar from "./components/NavBar";
import Footer from './components/Footer';
import PageErrorBoundary from './components/PageErrorBoundary';

import {
  SettingsProvider,
} from "./context/SettingsContext";

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-page text-main transition-colors duration-300 dark:bg-[#050b19] dark:text-white">
          <Navbar />

          <PageErrorBoundary>
          <Suspense fallback={<main className="flex min-h-dvh items-center justify-center bg-page p-6 text-muted" role="status">Sahifa yuklanmoqda…</main>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/astronomy" element={<Astronomy />} />
            <Route path="/astronomy/telescope" element={<SpaceTelescope />} />
            <Route path="/geography" element={<Geography />} />
            <Route path="/geography/challenge" element={<GeographyChallenge />} />
            <Route path="/geography/flags" element={<FlagQuiz />} />
            <Route path="/geography/records" element={<EarthRecords />} />
            <Route path="/geography/map" element={<WorldMap />} />
            <Route path="/geography/time-atlas" element={<TimeAtlas />} />
            <Route path="*" element={<main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-page px-6 pt-28 text-center text-main"><p className="text-sm font-bold text-cyan-700 dark:text-cyan-300">404</p><h1 className="text-3xl font-black">Sahifa topilmadi</h1><p className="text-muted">Havolani tekshiring yoki bosh sahifaga qayting.</p><Link to="/" className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">Bosh sahifaga qaytish</Link></main>} />
          </Routes>
          </Suspense>
          </PageErrorBoundary>
          <Footer />
        </div>
      </BrowserRouter>
    </SettingsProvider>
  );
}
