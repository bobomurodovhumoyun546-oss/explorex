import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "../context/settings";
import { starsData } from "../data/universeData";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Html,
  useTexture,
  Line,
} from "@react-three/drei";
import * as THREE from "three";

import {
  Search,
  Pause,
  Play,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Orbit,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Eye,
} from "lucide-react";

import { Link } from "react-router-dom";
import SpaceInfo from "../components/SpaceInfo";
import AsteroidBelt from "../components/AsteroidBelt";
import DeepSpace from "../components/DeepSpace";
import { COSMIC_FAR, COSMIC_MAX_DISTANCE, cosmicViews, deepSpaceData } from "../data/deepSpaceData";
import AstronomyLab from "../components/AstronomyLab";
import { advanceTime, DAY, J2000, MAX_TIME, MIN_TIME, orbitalPosition } from "../data/orbitalMath";
import { spaceData } from "../data/spaceData";

// O'lchamlar va orbitalar ko'rgazmali.
// Haqiqiy astronomik masshtab emas.


// UI translations; canonical Uzbek object names remain stable for data lookups.
const uiTranslations = {
  uz: {
    solar: "Quyosh tizimi", stars: "Yulduzlar", back: "Orqaga",
    title: "Koinotni kashf et", subtitle: "Interaktiv 3D astronomiya laboratoriyasi",
    placeholder: "Sayyora yoki obyekt...", search: "Qidirish",
    notFound: "Bunday astronomik obyekt topilmadi.", objects: "Obyektlar",
    all: "Barchasi", planets: "Sayyoralar", dwarfs: "Mitti",
    pause: "To‘xtatish", play: "Davom ettirish", reset: "Qaytish",
    names: { "Quyosh":"Quyosh", "Merkuriy":"Merkuriy", "Venera":"Venera", "Yer":"Yer", "Mars":"Mars", "Serera":"Serera", "Yupiter":"Yupiter", "Saturn":"Saturn", "Uran":"Uran", "Neptun":"Neptun", "Pluton":"Pluton", "Haumea":"Haumea", "Makemake":"Makemake", "Erida":"Erida", "Oy":"Oy", "Fobos":"Fobos", "Deymos":"Deymos", "Yevropa":"Yevropa", "Ganimed":"Ganimed", "Kallisto":"Kallisto", "Titan":"Titan", "Enselad":"Enselad", "Reya":"Reya", "Yapet":"Yapet", "Titaniya":"Titaniya", "Triton":"Triton" }
  },
  en: {
    solar: "Solar System", stars: "Stars", back: "Back",
    title: "Explore the Universe", subtitle: "Interactive 3D astronomy laboratory",
    placeholder: "Planet or celestial object...", search: "Search",
    notFound: "No matching celestial object found.", objects: "Objects",
    all: "All", planets: "Planets", dwarfs: "Dwarf planets",
    pause: "Pause", play: "Resume", reset: "Reset view",
    names: { "Quyosh":"Sun", "Merkuriy":"Mercury", "Venera":"Venus", "Yer":"Earth", "Mars":"Mars", "Serera":"Ceres", "Yupiter":"Jupiter", "Saturn":"Saturn", "Uran":"Uranus", "Neptun":"Neptune", "Pluton":"Pluto", "Haumea":"Haumea", "Makemake":"Makemake", "Erida":"Eris", "Oy":"Moon", "Fobos":"Phobos", "Deymos":"Deimos", "Yevropa":"Europa", "Ganimed":"Ganymede", "Kallisto":"Callisto", "Titan":"Titan", "Enselad":"Enceladus", "Reya":"Rhea", "Yapet":"Iapetus", "Titaniya":"Titania", "Triton":"Triton" }
  },
  ru: {
    solar: "Солнечная система", stars: "Звёзды", back: "Назад",
    title: "Исследуйте Вселенную", subtitle: "Интерактивная 3D-лаборатория астрономии",
    placeholder: "Планета или небесный объект...", search: "Поиск",
    notFound: "Небесный объект не найден.", objects: "Объекты",
    all: "Все", planets: "Планеты", dwarfs: "Карликовые",
    pause: "Пауза", play: "Продолжить", reset: "Сбросить вид",
    names: { "Quyosh":"Солнце", "Merkuriy":"Меркурий", "Venera":"Венера", "Yer":"Земля", "Mars":"Марс", "Serera":"Церера", "Yupiter":"Юпитер", "Saturn":"Сатурн", "Uran":"Уран", "Neptun":"Нептун", "Pluton":"Плутон", "Haumea":"Хаумеа", "Makemake":"Макемаке", "Erida":"Эрида", "Oy":"Луна", "Fobos":"Фобос", "Deymos":"Деймос", "Yevropa":"Европа", "Ganimed":"Ганимед", "Kallisto":"Каллисто", "Titan":"Титан", "Enselad":"Энцелад", "Reya":"Рея", "Yapet":"Япет", "Titaniya":"Титания", "Triton":"Тритон" }
  },
};
const localizedName = (name, t) => t.names[name] || name;

const objects = [
  {
    name: "Merkuriy",
    size: 0.18,
    distance: 3,
    speed: 0.8,
    texture: "/textures/2k_mercury.jpg",
  },
  {
    name: "Venera",
    size: 0.3,
    distance: 4,
    speed: 0.6,
    texture: "/textures/2k_venus_surface.jpg",
  },
  {
    name: "Yer",
    size: 0.32,
    distance: 5.2,
    speed: 0.45,
    texture: "/textures/2k_earth_daymap.jpg",
  },
  {
    name: "Mars",
    size: 0.25,
    distance: 6.5,
    speed: 0.35,
    texture: "/textures/2k_mars.jpg",
  },
  {
    name: "Serera",
    size: 0.13,
    distance: 7.5,
    speed: 0.3,
    color: "#a9a49d",
  },
  {
    name: "Yupiter",
    size: 0.8,
    distance: 9,
    speed: 0.2,
    texture: "/textures/2k_jupiter.jpg",
  },
  {
    name: "Saturn",
    size: 0.7,
    distance: 12,
    speed: 0.15,
    texture: "/textures/2k_saturn.jpg",
  },
  {
    name: "Uran",
    size: 0.5,
    distance: 15,
    speed: 0.1,
    texture: "/textures/2k_uranus.jpg",
  },
  {
    name: "Neptun",
    size: 0.48,
    distance: 18,
    speed: 0.07,
    texture: "/textures/2k_neptune.jpg",
  },

  {
    name: "Pluton",
    size: 0.15,
    distance: 21,
    speed: 0.05,
    color: "#c7b4a2",
    texture: ""
  },
  {
    name: "Haumea",
    size: 0.14,
    distance: 23,
    speed: 0.04,
    color: "#b9c4ce",
    texture:"/textures/2k_haumea_fictional.jpg"
  },
  {
    name: "Makemake",
    size: 0.14,
    distance: 25,
    speed: 0.035,
    color: "#a77a65",
texture:"/textures/2k_makemake_fictional.jpg"
  },
  {
    name: "Erida",
    size: 0.15,
    distance: 28,
    speed: 0.025,
    color: "#d4d0c8",
    texture:"/textures/2k_eris_fictional.jpg"

  },
];

const moons = {
  Yer: [
    {
      name: "Oy",
      size: 0.09,
      distance: 0.65,
      speed: 0.8,
      color: "#b9b9b9",
    },
  ],

  Mars: [
    {
      name: "Fobos",
      size: 0.055,
      distance: 0.45,
      speed: 1.2,
      color: "#a99986",
    },
    {
      name: "Deymos",
      size: 0.045,
      distance: 0.7,
      speed: 0.7,
      color: "#8c8176",
    },
  ],

  Yupiter: [
    {
      name: "Io",
      size: 0.12,
      distance: 1.3,
      speed: 1.1,
      color: "#e4c35b",
    },
    {
      name: "Yevropa",
      size: 0.11,
      distance: 1.65,
      speed: 0.8,
      color: "#d9c7ad",
    },
    {
      name: "Ganimed",
      size: 0.15,
      distance: 2,
      speed: 0.6,
      color: "#9c8b7a",
    },
    {
      name: "Kallisto",
      size: 0.13,
      distance: 2.35,
      speed: 0.4,
      color: "#746a60",
    },
  ],

  Saturn: [
    {
      name: "Titan",
      size: 0.15,
      distance: 1.8,
      speed: 0.6,
      color: "#d3a45e",
    },
    {
      name: "Enselad",
      size: 0.07,
      distance: 2.2,
      speed: 0.9,
      color: "#e8eff5",
    },
    {
      name: "Reya",
      size: 0.1,
      distance: 2.6,
      speed: 0.5,
      color: "#b8b5ad",
    },
    {
      name: "Yapet",
      size: 0.1,
      distance: 3,
      speed: 0.3,
      color: "#827c76",
    },
  ],

  Uran: [
    {
      name: "Titaniya",
      size: 0.11,
      distance: 1,
      speed: 0.6,
      color: "#a5a6a5",
    },
  ],

  Neptun: [
    {
      name: "Triton",
      size: 0.12,
      distance: 1,
      speed: -0.6,
      color: "#c2b7ad",
    },
  ],
};


const sun = {
  name: "Quyosh",
  size: 1.6,
  texture: "/textures/2k_sun.jpg",
};

function OrbitLine({ object }) {
  const points = useMemo(() => Array.from({ length: 181 }, (_, i) => {
    const angle = i / 180 * Math.PI * 2;
    return orbitalPosition(object.name, J2000, object.distance, angle)
      || [Math.cos(angle) * object.distance, 0, Math.sin(angle) * object.distance];
  }), [object]);
  return <Line points={points} color="#64748b" transparent opacity={0.25} />;
}

function SimulationClock({ simulationTimeRef, running, speed, onTick }) {
  const sinceUpdate = useRef(0);
  useFrame((_, delta) => {
    if (!running) return;
    simulationTimeRef.current = advanceTime(simulationTimeRef.current, Math.min(delta, .1), speed);
    sinceUpdate.current += delta;
    if (sinceUpdate.current >= .2) {
      onTick(simulationTimeRef.current);
      sinceUpdate.current = 0;
    }
  }, -2);
  return null;
}

function TexturedSphere({ object, isSun = false }) {
  const texture = useTexture(object.texture);

  return (
    <mesh>
      <sphereGeometry args={[object.size, 48, 48]} />

      {isSun ? (
        <meshBasicMaterial map={texture} />
      ) : (
        <meshStandardMaterial
          map={texture}
          roughness={0.9}
        />
      )}
    </mesh>
  );
}

function ColoredSphere({ object }) {
  return (
    <mesh>
      <sphereGeometry args={[object.size, 40, 40]} />
      <meshStandardMaterial
        color={object.color || "#aab4c2"}
        roughness={0.85}
      />
    </mesh>
  );
}



function Moon({ moon, simulationTimeRef, onSelect, parentRef, positionsRef, t }) {
  const moonRef = useRef();


  useFrame(() => {
    // Date-linked educational moon motion (not an ephemeris).
    const angle = (simulationTimeRef.current - J2000) / DAY * moon.speed * .1;
    const x = Math.cos(angle) * moon.distance;
    const z = Math.sin(angle) * moon.distance;

    if (moonRef.current) {
      moonRef.current.position.set(x, 0, z);

      if (parentRef.current) {
        const worldPosition = new THREE.Vector3();

        moonRef.current.getWorldPosition(worldPosition);

        positionsRef.current[moon.name] = worldPosition;
      }
    }
  });

  return (
    <group ref={moonRef}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(moon);
        }}
      >
        <sphereGeometry args={[moon.size, 24, 24]} />

        <meshStandardMaterial
          color={moon.color}
          roughness={0.9}
        />
      </mesh>

      <Html
        center
        position={[0, moon.size + 0.16, 0]}
        distanceFactor={10}
        style={{ pointerEvents: "none" }}
      >
        <span className="whitespace-nowrap rounded-md bg-black/75 px-2 py-1 text-[10px] text-cyan-200">
          {localizedName(moon.name, t)}
        </span>
      </Html>
    </group>
  );
}



function Planet({ object, simulationTimeRef, onSelect, positionsRef, t }) {
  const group = useRef();
  useFrame(() => {
    const time = simulationTimeRef.current;
    const angle = (time - J2000) / DAY * object.speed * .025;
    const point = orbitalPosition(object.name, time, object.distance)
      || [Math.cos(angle) * object.distance, 0, Math.sin(angle) * object.distance];
    if (group.current) group.current.position.set(...point);
    positionsRef.current[object.name] = new THREE.Vector3(...point);
  });
  

  return (
    <group ref={group}>
      <group
        onClick={(event) => {
          event.stopPropagation();
          onSelect(object);
        }}
      >
        {object.texture ? (
          <TexturedSphere object={object} />
        ) : (
          <ColoredSphere object={object} />
        )}

        {object.name === "Saturn" && (
          <mesh rotation={[-Math.PI / 2.5, 0, 0]}>
            <ringGeometry args={[0.9, 1.4, 96]} />
            <meshStandardMaterial
              color="#c9b68b"
              side={THREE.DoubleSide}
              transparent
              opacity={0.75}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      <Html
        center
        position={[0, object.size + 0.35, 0]}
        distanceFactor={12}
        style={{ pointerEvents: "none" }}
      >
        <span className="whitespace-nowrap rounded-lg border border-white/10 bg-black/75 px-2 py-1 text-xs font-semibold text-white">
          {localizedName(object.name, t)}
        </span>
      </Html>
      
{(moons[object.name] || []).map((moon) => (
  <Moon
    key={localizedName(moon.name, t)}
    moon={moon}
    simulationTimeRef={simulationTimeRef}
    onSelect={onSelect}
    parentRef={group}
    positionsRef={positionsRef}
    t={t}
  />
))}

    </group>
  );
}

function SunObject({ onSelect, t }) {
  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        onSelect(sun);
      }}
    >
      <TexturedSphere object={sun} isSun />

      <pointLight
        intensity={180}
        distance={100}
        decay={2}
      />

      <Html
        center
        position={[0, 2.1, 0]}
        style={{ pointerEvents: "none" }}
      >
        <span className="rounded-lg bg-orange-500/20 px-3 py-1 text-sm font-bold text-orange-300">
          {localizedName("Quyosh", t)}
        </span>
      </Html>
    </group>
  );
}


function CameraController({ selected, positionsRef, resetSignal, viewRequest }) {
  const { camera, controls } = useThree();

  const previousReset = useRef(resetSignal);
  const previousView = useRef(viewRequest);
  const previousSelection = useRef(null);
  const isFlying = useRef(false);

  useFrame((_, delta) => {
    if (!controls) return;

    if (previousView.current !== viewRequest) {
      previousView.current = viewRequest;
      isFlying.current = false;
      previousSelection.current = selected?.name ?? null;
      const direction = camera.position.clone().sub(controls.target).normalize();
      if (direction.lengthSq() === 0) direction.set(0, .5, 1).normalize();
      const distance = THREE.MathUtils.clamp(viewRequest.distance ?? camera.position.distanceTo(controls.target) * viewRequest.factor, 2, COSMIC_MAX_DISTANCE);
      if (viewRequest.distance) controls.target.set(0, 0, 0);
      camera.position.copy(controls.target).addScaledVector(direction, distance);
      controls.update();
      return;
    }

    // Kamera boshlang‘ich holatga qaytishi
    if (previousReset.current !== resetSignal) {
      previousReset.current = resetSignal;
      previousSelection.current = null;
      isFlying.current = false;

      camera.position.set(0, 22, 38);
      controls.target.set(0, 0, 0);
      controls.update();
      return;
    }

    // Yangi obyekt tanlanganda parvozni boshlash
    const selectedName = selected?.name ?? null;

    if (previousSelection.current !== selectedName) {
      previousSelection.current = selectedName;
      isFlying.current = Boolean(selectedName);
    }

    if (!selected || !isFlying.current) return;

    const target = positionsRef.current[selected.name];
    if (!target) return;

    // Haqiqiy radius emas, 3D model radiusi!
    const visualRadius =
      selected.visualSize ??
      selected.size ??
      0.5;

    const distance = Math.max(visualRadius * 4, 2.5);

    const desiredPosition = target.clone().add(
      new THREE.Vector3(
        distance * 0.7,
        distance * 0.35,
        distance
      )
    );

    const smooth = 1 - Math.exp(-2.5 * delta);

    camera.position.lerp(desiredPosition, smooth);
    controls.target.lerp(target, smooth);
    controls.update();

    // Yetib borgach kamerani foydalanuvchiga topshirish
    if (
      camera.position.distanceTo(desiredPosition) < 0.08 &&
      controls.target.distanceTo(target) < 0.08
    ) {
      isFlying.current = false;
    }
  });

  return null;
}


function SolarSystem({
  t,
  simulationTimeRef,
  selected,
  onSelect,
  positionsRef,
  resetView,
  viewRequest,
}) {
  const controlsRef = useRef();

  return (
    <>
      <color attach="background" args={["#02040e"]} />

      <ambientLight intensity={0.5} />

      <Stars
        radius={70000}
        depth={15000}
        count={6000}
        factor={4}
        saturation={0}
      />

      <Suspense fallback={null}>
        <SunObject onSelect={onSelect} t={t} />
        <AsteroidBelt simulationTimeRef={simulationTimeRef} />

        {objects.map((object) => (
          <group key={object.name}>
            <OrbitLine object={object} />

            <Planet
              object={object}
              simulationTimeRef={simulationTimeRef}
              onSelect={onSelect}
              positionsRef={positionsRef}
              t={t}
            />
          </group>
        ))}
      </Suspense>

      <UniverseStars onSelect={onSelect} positionsRef={positionsRef} />
      <DeepSpace onSelect={onSelect} positionsRef={positionsRef} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        minDistance={2}
        maxDistance={COSMIC_MAX_DISTANCE}
        zoomSpeed={1.5}
      />

      <CameraController
        selected={selected}
        positionsRef={positionsRef}
        controlsRef={controlsRef}
        resetSignal={resetView}
        viewRequest={viewRequest}
      />
    </>
  );
}

const universeStars = starsData
      .filter((star) => star.id !== "sun")
      .map((star, index) => {
        const angle = index * 2.39996;
        const distance = 65 + Math.sqrt(index) * 35;

        return {
          ...star,
          position: [
            Math.cos(angle) * distance,
            Math.sin(index * 1.7) * 30,
            Math.sin(angle) * distance,
          ],
          visualSize: Math.max(
            0.5,
            Math.min(3, Math.log10(star.radius + 1) * 1.2)
          ),
        };
      });

const mapObjects = [sun, ...objects, ...universeStars, ...deepSpaceData];

function UniverseStars({ onSelect, positionsRef }) {


  return (
    <group>
      {universeStars.map((star) => (
        <group
          key={star.id}
          position={star.position}
          ref={(element) => {
            if (element) {
              positionsRef.current[star.name] =
                new THREE.Vector3(...star.position);
            }
          }}
        >
          <mesh
            onClick={(event) => {
              event.stopPropagation();
              onSelect(star);
            }}
          >
            <sphereGeometry args={[star.visualSize, 32, 32]} />
            <meshBasicMaterial color={star.color} />
          </mesh>

          <pointLight
            color={star.color}
            intensity={8}
            distance={15}
          />

          <Html
            position={[0, star.visualSize + 1.5, 0]}
            center
            distanceFactor={35}
            style={{ pointerEvents: "none" }}
          >
            <div className="whitespace-nowrap rounded-lg border border-white/10 bg-black/75 px-3 py-1 text-xs text-white">
              {star.name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}


export default function Astronomy() {
  const { language, theme, mapOnly, setMapOnly } = useSettings();
  const t = uiTranslations[language] || uiTranslations.uz;
  const isDark = theme === "dark";
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(true);
  const [search, setSearch] = useState("");
  const [resetView, setResetView] = useState(0);
  const [category, setCategory] = useState("all");
  const [error, setError] = useState("");



  const positionsRef = useRef({ Quyosh: new THREE.Vector3(0, 0, 0) });
  const [initialTime] = useState(() => Math.min(MAX_TIME, Math.max(MIN_TIME, Date.now())));
  const simulationTimeRef = useRef(initialTime);
  const [clockTime, setClockTime] = useState(initialTime);
  const [speed, setSpeed] = useState(10);
  const [labOpen, setLabOpen] = useState(false);
  const [viewRequest, setViewRequest] = useState({ distance: 55 });
  useEffect(() => () => setMapOnly(false), [setMapOnly]);
  useEffect(() => {
    if (!mapOnly) return;
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      if (selected) setSelected(null);
      else setMapOnly(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mapOnly, selected, setMapOnly]);
  function toggleMapOnly() {
    setLabOpen(false);
    setSelected(null);
    setMapOnly(value => !value);
  }







  function changeDate(value) {
    const time = Date.parse(`${value}T00:00:00Z`);
    if (!Number.isFinite(time) || time < MIN_TIME || time > MAX_TIME) return;
    simulationTimeRef.current = time;
    setClockTime(time);
    setRunning(false);
  }

  function selectObject(object) {
    const details = spaceData.find(
      (item) => item.name === object.name
    );

    // 3D o'lchamni saqlagan holda ma'lumotlarni qo'shamiz.
    setLabOpen(false);
    setSelected({
      ...object,
      ...details,
    });


    setError("");
  }

  function searchObject() {
    const query = search.trim().toLowerCase();

    if (!query) return;

    const found = mapObjects.find((object) =>
      (object.name.toLowerCase().includes(query) || localizedName(object.name, t).toLowerCase().includes(query) || object.aliases?.some(alias => alias.toLowerCase().includes(query)))
    );

    if (found) {
      selectObject(found);
    } else {
      setError(t.notFound);
    }
  }

  function resetCamera() {
    setSelected(null);
    setResetView((n) => n + 1);
    setError("");
  }

  const filteredObjects = mapObjects.filter((object) => {
    const data = spaceData.find(
      (item) => item.name === object.name
    );

    if (["galaxies", "blackholes"].includes(category)) return object.kind === category;

    if (category === "stars") {
      return object.name === sun.name || universeStars.some((star) => star.id === object.id);
    }

    if (category === "planets") {
      return data?.type === "Sayyora";
    }

    if (category === "dwarfs") {
      return data?.type === "Mitti sayyora";
    }

    return true;
  });

  return (
    <div data-map-only={mapOnly} className={`relative h-dvh w-full overflow-hidden transition-colors duration-300 ${isDark ? "bg-page text-main" : "bg-[#dce8f3] text-slate-900"}`}>
      {/* 3D KOINOT */}
      <Canvas
        dpr={[1, 1.5]}
        className="space-map-canvas"
        camera={{
          position: [0, 35, 45],
          fov: 55,
          far: COSMIC_FAR,
        }}
      >
        <SimulationClock simulationTimeRef={simulationTimeRef} running={running} speed={speed} onTick={setClockTime} />
<SolarSystem
          t={t}
          simulationTimeRef={simulationTimeRef}
          selected={selected}
          onSelect={selectObject}
          positionsRef={positionsRef}
          resetView={resetView}
          viewRequest={viewRequest}
        />
      </Canvas>
      <button type="button" onClick={toggleMapOnly} aria-pressed={mapOnly}
        aria-label={mapOnly ? "Boshqaruvlarni ko‘rsatish" : "Faqat xaritani ko‘rsatish"}
        title={mapOnly ? "Boshqaruvlarni ko‘rsatish (Esc)" : "Butun xarita"}
        className={`absolute right-4 z-50 inline-flex items-center gap-2 rounded-xl border border-line bg-panel/95 px-4 py-3 text-sm font-bold text-main shadow-lg backdrop-blur-xl sm:right-6 ${mapOnly ? "top-4" : "top-56"}`}>
        {mapOnly ? <Eye size={18} /> : <Maximize size={18} />}
        {mapOnly ? "Orqaga" : "Butun koinot"}
      </button>
      {!mapOnly && <>




      <button onClick={() => { setLabOpen(value => !value); setSelected(null); }} aria-expanded={labOpen}
        className="absolute right-4 top-40 z-40 rounded-xl border border-cyan-400/30 bg-panel/90 px-4 py-3 text-sm font-bold text-cyan-700 dark:text-cyan-200 backdrop-blur-xl sm:right-6">
        {labOpen ? 'Laboratoriyani yopish' : '🔬 Laboratoriya'}
      </button>
      {labOpen && <AstronomyLab isDark={isDark} clockTime={clockTime} onDateChange={changeDate} speed={speed} onSpeedChange={setSpeed} onClose={() => setLabOpen(false)} />}

      {!selected && !labOpen && <div className="absolute bottom-24 right-4 z-20 w-40 rounded-2xl border border-cyan-300/20 bg-panel/85 p-3 text-main backdrop-blur-xl sm:right-6 sm:w-64">
        <p className="mb-2 text-xs font-bold text-cyan-700 dark:text-cyan-200">Koinot masshtabi</p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">{cosmicViews.map(view => <button key={view.id} onClick={() => {setSelected(null);setViewRequest({distance:view.distance});}} className="rounded-lg bg-inset px-2 py-2 text-xs hover:bg-cyan-300/20">{view.label}</button>)}</div>
        <div className="mt-2 flex gap-2"><button aria-label="Yaqinlashtirish" onClick={() => setViewRequest({factor:.5})} className="flex flex-1 justify-center rounded-lg bg-inset p-2 hover:bg-hover"><ZoomIn size={18} /></button><button aria-label="Uzoqlashtirish" onClick={() => setViewRequest({factor:2})} className="flex flex-1 justify-center rounded-lg bg-inset p-2 hover:bg-hover"><ZoomOut size={18} /></button></div>
        <p className="mt-2 text-[10px] leading-4 text-subtle">Masofa va o‘lchamlar ko‘rgazmali. G‘ildirak bilan uzoqlashing.</p>
      </div>}

      <Link to="/astronomy/telescope" className="absolute left-4 top-40 z-20 rounded-xl border border-fuchsia-300/30 bg-panel/90 px-4 py-3 text-sm font-bold text-fuchsia-700 dark:text-fuchsia-200 backdrop-blur-xl sm:left-6 sm:top-80">Space Telescope</Link>

      {/* INTERFEYS */}
      
      <div className="pointer-events-none absolute inset-0">

        {/* SAHIFA NOMI */}
        <div className="pointer-events-auto absolute left-4 top-24 max-w-[calc(100%-2rem)] sm:left-6">
          <Link
            to="/"
            className={`mb-3 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm backdrop-blur-xl transition ${isDark ? "border-line bg-panel/95 text-main hover:bg-hover" : "border-slate-200 bg-panel/90 text-slate-900 hover:bg-slate-100"}`}
          >
            <ArrowLeft size={17} />
            {t.back}
          </Link>

          <div className={`hidden rounded-2xl border p-5 backdrop-blur-xl sm:block ${isDark ? "border-line bg-panel/95" : "border-slate-200 bg-panel/90 shadow-lg"}`}>
            <div className="mb-2 flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
              <Sparkles size={17} />
              <span className="text-xs font-bold uppercase tracking-widest">
                ExploreX Universe
              </span>
            </div>

            <h1 className="text-2xl font-black">
              {t.title}
            </h1>

            <p className={`mt-2 text-sm ${isDark ? "text-subtle" : "text-slate-600"}`}>
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* QIDIRUV */}
        <div className={`pointer-events-auto absolute right-4 top-24 w-64 max-w-[calc(100%-2rem)] rounded-2xl border p-3 backdrop-blur-xl sm:right-6 sm:w-80 ${isDark ? "border-line bg-panel/95" : "border-slate-200 bg-panel/90 shadow-lg"}`}>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  searchObject();
                }
              }}
              placeholder={t.placeholder}
              className={`min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-subtle ${isDark ? "text-main" : "text-slate-900"}`}
            />

            <button
              onClick={searchObject}
              aria-label={t.search}
              className="rounded-xl bg-cyan-400 p-2 text-slate-950 transition hover:bg-cyan-300"
            >
              <Search size={19} />
            </button>
          </div>

          {error && (
            <p className="mt-2 px-2 text-xs text-red-700 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* OBYEKTLAR RO'YXATI */}
        <div className={`pointer-events-auto absolute bottom-28 left-4 max-h-64 w-52 overflow-y-auto rounded-2xl border p-3 backdrop-blur-xl sm:left-6 sm:w-60 ${isDark ? "border-line bg-panel/95" : "border-slate-200 bg-panel/95 shadow-lg"}`}>
          <div className="mb-3 flex items-center gap-2 px-2">
            <Orbit size={16} className="text-cyan-700 dark:text-cyan-400" />
            <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-muted" : "text-slate-700"}`}>
              {t.objects}
            </p>
          </div>

          <div className="mb-3 flex flex-wrap gap-1">
            {[
              { id: "all", label: t.all },
              { id: "planets", label: t.planets },
              { id: "dwarfs", label: t.dwarfs },
              { id: "stars", label: t.stars },
              { id: "blackholes", label: "Qora tuynuklar" },
              { id: "galaxies", label: "Galaktikalar" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                  category === item.id
                    ? "bg-cyan-400 text-slate-950"
                    : isDark ? "bg-inset text-muted hover:bg-hover" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredObjects.map((object) => (
            <button
              key={object.name}
              onClick={() => selectObject(object)}
              className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                selected?.name === object.name
                  ? "bg-cyan-400/15 text-cyan-700 dark:text-cyan-300"
                  : isDark ? "text-muted hover:bg-hover" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{localizedName(object.name, t)}</span>
              <ChevronRight size={15} />
            </button>
          ))}
        </div>

        {/* BOSHQARUV */}
        <div className={`pointer-events-auto absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-xl ${isDark ? "border-line bg-panel/95" : "border-slate-200 bg-panel/95"}`}>
          <button
            onClick={() => setRunning(!running)}
            className="flex items-center gap-2 text-sm font-semibold transition hover:text-cyan-700 dark:hover:text-cyan-400"
          >
            {running ? (
              <Pause size={19} />
            ) : (
              <Play size={19} />
            )}
            {running ? t.pause : t.play}
          </button>

          <div className={`h-6 w-px ${isDark ? "bg-inset" : "bg-slate-300"}`} />

          <button
            onClick={resetCamera}
            className="flex items-center gap-2 text-sm font-semibold transition hover:text-cyan-700 dark:hover:text-cyan-400"
          >
            <RotateCcw size={19} />
            {t.reset}
          </button>
        </div>

      </div>
    </>}
      <SpaceInfo
        selected={labOpen ? null : selected}
        mapOnly={mapOnly}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
