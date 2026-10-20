import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Astronomy from "./pages/Astronomy";
import Geography from "./pages/Geography";
import WorldMap from "./pages/WorldMap";

import Navbar from "./components/Navbar";

import {
  SettingsProvider,
} from "./context/SettingsContext";

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#f4f1e9] text-slate-900 transition-colors duration-300 dark:bg-[#050b19] dark:text-white">
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/astronomy" element={<Astronomy />} />
            <Route path="/geography" element={<Geography />} />
            <Route path="/geography/map" element={<WorldMap />} />
          </Routes>
        </div>
      </BrowserRouter>
    </SettingsProvider>
  );
}