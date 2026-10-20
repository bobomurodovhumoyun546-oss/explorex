import { Suspense, useMemo, useRef, useState } from "react";
import { starsData } from "../data/universeData";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Html,
  useTexture,
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
} from "lucide-react";

import { Link } from "react-router-dom";
import SpaceInfo from "../components/SpaceInfo";
import { spaceData } from "../data/spaceData";

// O'lchamlar va orbitalar ko'rgazmali.
// Haqiqiy astronomik masshtab emas.

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
    texture:"public/textures/2k_haumea_fictional.jpg"
  },
  {
    name: "Makemake",
    size: 0.14,
    distance: 25,
    speed: 0.035,
    color: "#a77a65",
texture:"public/textures/2k_makemake_fictional.jpg"
  },
  {
    name: "Erida",
    size: 0.15,
    distance: 28,
    speed: 0.025,
    color: "#d4d0c8",
    texture:"public/textures/2k_eris_fictional.jpg"

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
  texture: "public/textures/2k_sun.jpg",
};

function OrbitLine({ radius }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry
        args={[radius - 0.008, radius + 0.008, 180]}
      />
      <meshBasicMaterial
        color="#64748b"
        transparent
        opacity={0.25}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
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



function Moon({ moon, running, onSelect, parentRef, positions }) {
  const moonRef = useRef();
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (running) {
      angle.current += delta * moon.speed;
    }

    const x = Math.cos(angle.current) * moon.distance;
    const z = Math.sin(angle.current) * moon.distance;

    if (moonRef.current) {
      moonRef.current.position.set(x, 0, z);

      if (parentRef.current) {
        const worldPosition = new THREE.Vector3();

        moonRef.current.getWorldPosition(worldPosition);

        positions.current[moon.name] = worldPosition;
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
        <span className="whitespace-nowrap rounded-md bg-black/70 px-2 py-1 text-[10px] text-cyan-200">
          {moon.name}
        </span>
      </Html>
    </group>
  );
}



function Planet({ object, running, onSelect, positions }) {
  const group = useRef();
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (running) {
      angle.current += delta * object.speed * 0.25;
    }

    const x = Math.cos(angle.current) * object.distance;
    const z = Math.sin(angle.current) * object.distance;

    if (group.current) {
      group.current.position.set(x, 0, z);
    }

    positions.current[object.name] = new THREE.Vector3(
      x,
      0,
      z
    );
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
          {object.name}
        </span>
      </Html>
      
{(moons[object.name] || []).map((moon) => (
  <Moon
    key={moon.name}
    moon={moon}
    running={running}
    onSelect={onSelect}
    parentRef={group}
    positions={positions}
  />
))}

    </group>
  );
}

function SunObject({ onSelect }) {
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
          Quyosh
        </span>
      </Html>
    </group>
  );
}


function CameraController({ selected, positions, resetSignal }) {
  const { camera, controls } = useThree();

  const previousReset = useRef(resetSignal);
  const previousSelection = useRef(null);
  const isFlying = useRef(false);

  useFrame((_, delta) => {
    if (!controls) return;

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

    const target = positions.current[selected.name];
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
  running,
  selected,
  onSelect,
  positions,
  resetView,
}) {
  const controlsRef = useRef();

  return (
    <>
      <color attach="background" args={["#02040e"]} />

      <ambientLight intensity={0.5} />

      <Stars
        radius={150}
        depth={80}
        count={6000}
        factor={4}
        saturation={0}
      />

      <Suspense fallback={null}>
        <SunObject onSelect={onSelect} />

        {objects.map((object) => (
          <group key={object.name}>
            <OrbitLine radius={object.distance} />

            <Planet
              object={object}
              running={running}
              onSelect={onSelect}
              positions={positions}
            />
          </group>
        ))}
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        minDistance={2}
        maxDistance={120}
      />

      <CameraController
        selected={selected}
        positions={positions}
        controlsRef={controlsRef}
        resetView={resetView}
      />
    </>
  );
}

function UniverseStars({ onSelect, positions }) {
  const stars = useMemo(() => {
    return starsData
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
  }, []);

  return (
    <group>
      {stars.map((star) => (
        <group
          key={star.id}
          position={star.position}
          ref={(element) => {
            if (element) {
              positions.current[star.name] =
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
            <div className="whitespace-nowrap rounded-lg border border-white/10 bg-black/70 px-3 py-1 text-xs text-white">
              {star.name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}


export default function Astronomy() {
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(true);
  const [search, setSearch] = useState("");
  const [resetView, setResetView] = useState(false);
  const [category, setCategory] = useState("all");
  const [error, setError] = useState("");
const [spaceMode, setSpaceMode] = useState("solar");


  const positions = useRef({});

  function selectObject(object) {
    const details = spaceData.find(
      (item) => item.name === object.name
    );

    // 3D o'lchamni saqlagan holda ma'lumotlarni qo'shamiz.
    setSelected({
      ...object,
      ...details,
    });

    setResetView(false);
    setError("");
  }

  function searchObject() {
    const query = search.trim().toLowerCase();

    if (!query) return;

    const found = [sun, ...objects].find((object) =>
      object.name.toLowerCase().includes(query)
    );

    if (found) {
      selectObject(found);
    } else {
      setError("Bunday astronomik obyekt topilmadi.");
    }
  }

  function resetCamera() {
    setSelected(null);
    setResetView(true);
    setError("");
  }

  const filteredObjects = objects.filter((object) => {
    const data = spaceData.find(
      (item) => item.name === object.name
    );

    if (category === "planets") {
      return data?.type === "Sayyora";
    }

    if (category === "dwarfs") {
      return data?.type === "Mitti sayyora";
    }

    return true;
  });

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#02040e] text-white">
      {/* 3D KOINOT */}
      <Canvas
        camera={{
          position: [0, 35, 45],
          fov: 55,
          far: 1000,
        }}
      >
        
<UniverseStars
  onSelect={setSelected}
  positions={positions}
/>

        <SolarSystem
          running={running}
          selected={selected}
          onSelect={selectObject}
          positions={positions}
          resetView={resetView}
        />
      </Canvas>

      {/* INTERFEYS */}
      
<div className="pointer-events-auto absolute left-1/2 top-24 z-40 flex -translate-x-1/2 gap-2 rounded-2xl border border-white/10 bg-black/70 p-2 backdrop-blur-xl">
  <button
    onClick={() => setSpaceMode("solar")}
    className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
      spaceMode === "solar"
        ? "bg-cyan-400 text-black"
        : "text-white hover:bg-white/10"
    }`}
  >
    Quyosh tizimi
  </button>

  <button
    onClick={() => setSpaceMode("stars")}
    className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
      spaceMode === "stars"
        ? "bg-violet-500 text-white"
        : "text-white hover:bg-white/10"
    }`}
  >
    ✨ Yulduzlar
  </button>
</div>

      <div className="pointer-events-none absolute inset-0">

        {/* SAHIFA NOMI */}
        <div className="pointer-events-auto absolute left-4 top-24 max-w-[calc(100%-2rem)] sm:left-6">
          <Link
            to="/"
            className="mb-3 flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-sm backdrop-blur-xl transition hover:bg-white/10"
          >
            <ArrowLeft size={17} />
            Orqaga
          </Link>

          <div className="hidden rounded-2xl border border-white/10 bg-black/60 p-5 backdrop-blur-xl sm:block">
            <div className="mb-2 flex items-center gap-2 text-cyan-400">
              <Sparkles size={17} />
              <span className="text-xs font-bold uppercase tracking-widest">
                ExploreX Universe
              </span>
            </div>

            <h1 className="text-2xl font-black">
              Koinotni kashf et
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Interaktiv 3D astronomiya laboratoriyasi
            </p>
          </div>
        </div>

        {/* QIDIRUV */}
        <div className="pointer-events-auto absolute right-4 top-24 w-64 max-w-[calc(100%-2rem)] rounded-2xl border border-white/10 bg-black/70 p-3 backdrop-blur-xl sm:right-6 sm:w-80">
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  searchObject();
                }
              }}
              placeholder="Sayyora yoki obyekt..."
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500"
            />

            <button
              onClick={searchObject}
              aria-label="Qidirish"
              className="rounded-xl bg-cyan-400 p-2 text-slate-950 transition hover:bg-cyan-300"
            >
              <Search size={19} />
            </button>
          </div>

          {error && (
            <p className="mt-2 px-2 text-xs text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* OBYEKTLAR RO'YXATI */}
        <div className="pointer-events-auto absolute bottom-28 left-4 max-h-64 w-52 overflow-y-auto rounded-2xl border border-white/10 bg-black/75 p-3 backdrop-blur-xl sm:left-6 sm:w-60">
          <div className="mb-3 flex items-center gap-2 px-2">
            <Orbit size={16} className="text-cyan-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Obyektlar
            </p>
          </div>

          <div className="mb-3 flex flex-wrap gap-1">
            {[
              { id: "all", label: "Barchasi" },
              { id: "planets", label: "Sayyoralar" },
              { id: "dwarfs", label: "Mitti" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                  category === item.id
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
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
                  ? "bg-cyan-400/15 text-cyan-300"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <span>{object.name}</span>
              <ChevronRight size={15} />
            </button>
          ))}
        </div>

        {/* BOSHQARUV */}
        <div className="pointer-events-auto absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-2xl border border-white/10 bg-black/75 px-5 py-3.5 shadow-2xl backdrop-blur-xl">
          <button
            onClick={() => setRunning(!running)}
            className="flex items-center gap-2 text-sm font-semibold transition hover:text-cyan-400"
          >
            {running ? (
              <Pause size={19} />
            ) : (
              <Play size={19} />
            )}
            {running ? "To'xtatish" : "Davom ettirish"}
          </button>

          <div className="h-6 w-px bg-white/20" />

          <button
            onClick={resetCamera}
            className="flex items-center gap-2 text-sm font-semibold transition hover:text-cyan-400"
          >
            <RotateCcw size={19} />
            Qaytish
          </button>
        </div>

        {/* BATAFSIL MA'LUMOT */}
        <SpaceInfo
          selected={selected}
          onClose={() => setSelected(null)}
        />
      </div>
    </div>
  );
}
