import {
  BrowserRouter,
  Routes,
  Route,
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
          </Routes>
          </Suspense>
          </PageErrorBoundary>
        </div>
      </BrowserRouter>
    </SettingsProvider>
  );
}
