import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Astronomy from "./pages/Astronomy";
import Geography from "./pages/Geography";
import GeographyChallenge from "./pages/GeographyChallenge";
import FlagQuiz from "./pages/FlagQuiz";
import EarthRecords from "./pages/EarthRecords";
import WorldMap from "./pages/WorldMap";
import SpaceTelescope from "./pages/SpaceTelescope";
import TimeAtlas from "./pages/TimeAtlas";

import Navbar from "./components/NavBar";

import {
  SettingsProvider,
} from "./context/SettingsContext";

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-page text-main transition-colors duration-300 dark:bg-[#050b19] dark:text-white">
          <Navbar />

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
        </div>
      </BrowserRouter>
    </SettingsProvider>
  );
}
