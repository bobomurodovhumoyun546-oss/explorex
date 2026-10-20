
import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Earth,
  Globe2,
  Map,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  Trophy,
} from "lucide-react";
import * as THREE from "three";

function EarthModel({ rotating }) {
  const earthRef = useRef(null);
  const texture = useTexture("/textures/2k_earth_daymap.jpg");

  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((_, delta) => {
    if (earthRef.current && rotating) {
      earthRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.4, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.46, 64, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.09}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function EarthScene({ rotating }) {
  return (
    <Canvas
      camera={{
        position: [0, 0, 7.5],
        fov: 45,
        near: 0.1,
        far: 1000,
      }}
      gl={{ antialias: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#06101f"]} />

      <ambientLight intensity={1.2} />
      <directionalLight
        position={[5, 3, 5]}
        intensity={2.5}
      />

      <Stars
        radius={100}
        depth={50}
        count={2000}
        factor={3}
        fade
      />

      <Suspense fallback={null}>
        <EarthModel rotating={rotating} />
      </Suspense>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={14}
        enablePan={false}
      />
    </Canvas>
  );
}

const features = [
  {
    icon: Globe2,
    title: "3D Yer globusi",
    text: "Yer sharini erkin aylantiring va kattalashtiring.",
  },
  {
    icon: Map,
    title: "Dunyo xaritasi",
    text: "Davlatlar va shaharlarning joylashuvini o‘rganing.",
  },
  {
    icon: Trophy,
    title: "Geography Challenge",
    text: "Davlatlarni xaritadan topib, bilimingizni sinang.",
  },
];

export default function Geography() {
  const [rotating, setRotating] = useState(true);

  return (
    <main className="min-h-screen bg-[#06101f] text-white">
      {/* HERO */}
      <section className="relative min-h-[760px] overflow-hidden lg:min-h-[850px]">
        <div className="absolute inset-0">
          <EarthScene rotating={rotating} />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#06101f]/80 via-transparent to-transparent" />

        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[760px] max-w-7xl flex-col justify-center px-6 pt-24 lg:min-h-[850px]">
          <div className="max-w-lg">
            <Link
              to="/"
              className="pointer-events-auto mb-8 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm backdrop-blur-md transition hover:bg-white/10"
            >
              <ArrowLeft size={16} />
              Bosh sahifa
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-bold tracking-[0.2em] text-emerald-300"
            >
              <Earth size={16} />
              EXPLORE EARTH
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black leading-[1.1] md:text-7xl"
            >
              DUNYONI
              <span className="block bg-gradient-to-r from-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                KASHF ET!
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-7 max-w-md text-base leading-8 text-slate-300"
            >
              Yer sayyorasining barcha sirlarini o‘rganing.
              Dunyo xaritasini ko‘ring, davlatlar va
              shaharlarni kashf eting hamda interaktiv
              challenge orqali bilimingizni sinang.
            </motion.p>

            <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
              <a
                href="#explore-geography"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
              >
                <MousePointer2 size={18} />
                Boshlash
                <ArrowRight size={18} />
              </a>

              <button
                onClick={() => setRotating((value) => !value)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold backdrop-blur-md transition hover:bg-white/20"
              >
                {rotating ? <Pause size={18} /> : <Play size={18} />}
                {rotating ? "Aylanishni to‘xtatish" : "Aylantirish"}
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-8 left-0 right-0 flex items-center justify-center gap-2 text-xs text-slate-400">
            <RotateCcw size={15} />
            Globusni sichqoncha bilan aylantiring
          </div>
        </div>
      </section>

      {/* IMKONIYATLAR */}
      <section className="border-t border-white/10 bg-[#091729] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-emerald-400">
              INTERACTIVE GEOGRAPHY
            </p>
            <h2 className="text-3xl font-black md:text-5xl">
              Geografiyani yangi usulda o‘rganing
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-3xl border border-white/10 bg-white/[0.035] p-7"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                    <Icon size={27} />
                  </div>

                  <h3 className="mb-3 text-xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="leading-7 text-slate-400">
                    {feature.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* IKKITA ASOSIY TUGMA */}
      <section
        id="explore-geography"
        className="px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-emerald-400">
              CHOOSE YOUR ADVENTURE
            </p>

            <h2 className="text-3xl font-black md:text-5xl">
              Sayohatingizni tanlang
            </h2>

            <p className="mt-5 text-slate-400">
              Dunyo xaritasini o‘rganing yoki challenge'da qatnashing.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* DUNYO XARITASI */}
            <Link
              to="/geography/map"
              className="group relative overflow-hidden rounded-[32px] border border-cyan-400/20 bg-gradient-to-br from-[#102d48] to-[#0b172b] p-9 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50"
            >
              <div className="mb-16 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <Map size={32} />
              </div>

              <p className="mb-3 text-xs font-bold tracking-[0.25em] text-cyan-300">
                EXPLORE THE WORLD
              </p>

              <h3 className="text-3xl font-black md:text-4xl">
                Dunyo xaritasi
              </h3>

              <p className="mt-4 max-w-sm leading-7 text-slate-300">
                Dunyo xaritasini ko‘ring. Davlatlar,
                poytaxtlar va shaharlarning joylashuvini
                interaktiv o‘rganing.
              </p>

              <span className="mt-8 inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950">
                Xaritani ko‘rish
                <ArrowRight size={19} />
              </span>
            </Link>

            {/* CHALLENGE */}
            <Link
              to="/geography/challenge"
              className="group relative overflow-hidden rounded-[32px] border border-emerald-400/20 bg-gradient-to-br from-[#103c32] to-[#0b172b] p-9 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-400/50"
            >
              <div className="mb-16 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <Trophy size={32} />
              </div>

              <p className="mb-3 text-xs font-bold tracking-[0.25em] text-emerald-300">
                TEST YOUR KNOWLEDGE
              </p>

              <h3 className="text-3xl font-black md:text-4xl">
                Davlat topish Challenge
              </h3>

              <p className="mt-4 max-w-sm leading-7 text-slate-300">
                6 ta hududdan birini tanlang.
                10 yoki 20 ta tasodifiy savolga javob
                bering. Har bir davlatni topish uchun
                30 soniya vaqtingiz bor!
              </p>

              <span className="mt-8 inline-flex items-center gap-3 rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950">
                Challenge boshlash
                <ArrowRight size={19} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
