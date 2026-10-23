import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { X } from "lucide-react";
import { planetComparison } from "../data/planetComparison";
import { eclipseGeometry } from "../data/orbitalMath";

const button = "rounded-lg border border-line bg-inset px-3 py-2 text-sm hover:bg-hover disabled:opacity-40";
const input = "w-full rounded-lg border border-line bg-panel px-3 py-2 text-main";

function ComparePlanets() {
  const [left, setLeft] = useState('Yer');
  const [right, setRight] = useState('Mars');
  const a = planetComparison.find(p => p[0] === left);
  const b = planetComparison.find(p => p[0] === right);
  const rows = [['Diametri (km)',1],['Massasi (10²⁴ kg)',2],['O‘rtacha harorati (°C)',3],['Tortishish kuchi (m/s²)',4]];
  return <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3">{[[left,setLeft,'Birinchi sayyora'],[right,setRight,'Ikkinchi sayyora']].map(([value,setValue,label]) => <label key={label} className="space-y-2 text-sm"><span>{label}</span><select className={input} value={value} onChange={e => setValue(e.target.value)}>{planetComparison.map(p => <option key={p[0]}>{p[0]}</option>)}</select></label>)}</div>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Sayyoralar xususiyatlarini taqqoslash</caption><thead><tr className="border-b border-line"><th className="py-3">Xususiyat</th><th className="px-2 text-cyan-700 dark:text-cyan-300">{left}</th><th className="px-2 text-amber-700 dark:text-amber-300">{right}</th></tr></thead><tbody>{rows.map(([label,i]) => <tr key={i} className="border-b border-line"><th className="py-3 font-normal text-muted">{label}</th><td className="px-2 tabular-nums">{a[i].toLocaleString('uz-UZ')}</td><td className="px-2 tabular-nums">{b[i].toLocaleString('uz-UZ')}</td></tr>)}</tbody></table></div>
    <p className="text-xs leading-5 text-subtle">Qiymatlar yaxlitlangan. Gaz gigantlarida harorat bulutlar qatlamiga tegishli; qattiq sirt mavjud emas. <a className="text-cyan-700 dark:text-cyan-300 underline" href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/" target="_blank" rel="noreferrer">NASA ma’lumotlari</a></p>
  </div>;
}

function Body({ position, radius, color, label, luminous = false }) {
  return <group position={position}><mesh castShadow receiveShadow><sphereGeometry args={[radius,48,48]} />{luminous ? <meshBasicMaterial color={color} /> : <meshStandardMaterial color={color} roughness={.9} />}</mesh><Html center position={[0,radius+.55,0]} style={{pointerEvents:'none'}}><span className="whitespace-nowrap text-xs text-[#ffffff]">{label}</span></Html></group>;
}

function EclipseSimulator() {
  const [phase,setPhase] = useState(0);
  const [tilt,setTilt] = useState(0);
  const {moon,kind} = eclipseGeometry(phase,tilt);
  const axisPoints = kind === 'solar' ? [[-8,0,0],moon,[3,moon[1]*11/(moon[0]+8),moon[2]*11/(moon[0]+8)]] : [[-8,0,0],[0,0,0],[5,0,0]];
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2"><button className={button} onClick={() => {setPhase(0);setTilt(0);}}>Quyosh tutilishi</button><button className={button} onClick={() => {setPhase(180);setTilt(0);}}>Oy tutilishi</button></div>
    <div className="h-64 overflow-hidden rounded-xl bg-black"><Canvas shadows camera={{position:[-2,9,15],fov:48}}><ambientLight intensity={.15} /><pointLight position={[-6.7,0,0]} intensity={180} castShadow shadow-mapSize={[1024,1024]} shadow-camera-near={.1} shadow-camera-far={30} shadow-bias={-.0005} /><Body position={[-8,0,0]} radius={1.2} color="#ffbe39" label="Quyosh" luminous /><Body position={[0,0,0]} radius={.8} color="#38a5e8" label="Yer" /><Body position={moon} radius={.27} color="#c5c9d1" label="Oy" /><Line points={axisPoints} color="#fbbf24" transparent opacity={.4} dashed dashSize={.2} gapSize={.15} /><OrbitControls makeDefault enablePan={false} minDistance={8} maxDistance={30} /></Canvas></div>
    <label className="block text-sm">Oy orbital burchagi: {phase}°<input className="mt-2 w-full" type="range" min="0" max="360" value={phase} onChange={e => setPhase(Number(e.target.value))} /></label>
    <label className="block text-sm">Orbita qiyaligi: {tilt}°<input className="mt-2 w-full" type="range" min="0" max="15" step=".1" value={tilt} onChange={e => setTilt(Number(e.target.value))} /></label>
    <p aria-live="polite" className="rounded-xl bg-cyan-400/10 p-3 text-sm text-cyan-700 dark:text-cyan-200">{kind === 'solar' ? 'Quyosh tutilishi: Oy Quyosh bilan Yer orasida. Oyning soyasi Yerga tushadi.' : kind === 'lunar' ? 'Oy tutilishi: Yer Quyosh bilan Oy orasida. Oy Yer soyasiga kiradi.' : 'Tutilish yo‘q: jismlar bir chiziqda joylashmagan.'}</p>
    <p className="text-xs leading-5 text-subtle">O‘quv modeli: o‘lcham va masofalar kattalashtirilgan. Bu haqiqiy tutilish sanalarini bashorat qilmaydi. Qiyalik tugun chizig‘i bo‘ylab berilgan: yangi yoki to‘lin Oy tugunda bo‘lsa, qiyalik mavjudligida ham tutilish yuz beradi.</p>
  </div>;
}

// Schematic observer-view patterns, not the arbitrary 3D positions in the universe map.
const constellations = {
  orion: {name:'Orion',note:'Uchta kamar yulduzi: Alnitak, Alnilam va Mintaka.',stars:[['Betelgeyze',-2,3],['Bellatrix',2,3.3],['Alnitak',-.7,0],['Alnilam',0,.35],['Mintaka',.7,.7],['Saiph',-1.6,-3],['Rigel',2.1,-2.5]],edges:[[0,1],[0,2],[2,3],[3,4],[4,1],[2,5],[4,6],[5,6]]},
  bear: {name:'Katta Ayiq',note:'Katta Cho‘mich — Katta Ayiq turkumining yetti mashhur yulduzidan iborat qismi.',stars:[['Dubhe',-4,1.5],['Merak',-4,-.7],['Phecda',-1.6,-1.1],['Megrez',-1.4,.9],['Alioth',.5,1.3],['Mizar',2.4,.5],['Alkaid',4,-1]],edges:[[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]]},
  cassiopeia: {name:'Kassiopeya',note:'Beshta yorqin yulduz osmondagi W shaklini hosil qiladi.',stars:[['Caph',-4,1.4],['Schedar',-2,-1.3],['Gamma Cas',0,1],['Ruchbah',2,-1.5],['Segin',4,1.7]],edges:[[0,1],[1,2],[2,3],[3,4]]},
};
function Constellations() {
  const [id,setId] = useState('orion');
  const [lines,setLines] = useState(true);
  const [names,setNames] = useState(true);
  const [selected,setSelected] = useState('');
  const c = constellations[id];
  return <div className="space-y-4">
    <label className="block text-sm">Yulduz turkumi<select className={`${input} mt-2`} value={id} onChange={e => {setId(e.target.value);setSelected('');}}>{Object.entries(constellations).map(([key,value]) => <option key={key} value={key}>{value.name}</option>)}</select></label>
    <div className="flex flex-wrap gap-4 text-sm"><label><input type="checkbox" checked={lines} onChange={e => setLines(e.target.checked)} /> Chiziqlar</label><label><input type="checkbox" checked={names} onChange={e => setNames(e.target.checked)} /> Nomlar</label></div>
    <div className="h-72 overflow-hidden rounded-xl bg-black"><Canvas camera={{position:[0,0,12],fov:50}}>{lines && c.edges.map(([a,b],i) => <Line key={`${id}-${i}`} points={[[c.stars[a][1],c.stars[a][2],0],[c.stars[b][1],c.stars[b][2],0]]} color="#67e8f9" lineWidth={1.5} />)}{c.stars.map(([name,x,y]) => <group key={name} position={[x,y,0]}><mesh onClick={() => setSelected(name)}><sphereGeometry args={[.14,20,20]} /><meshBasicMaterial color={selected === name ? '#fbbf24' : '#fff'} /></mesh>{names && <Html center position={[0,.4,0]} style={{pointerEvents:'none'}}><span className="whitespace-nowrap text-xs text-[#ffffff]">{name}</span></Html>}</group>)}<OrbitControls makeDefault enableRotate={false} enablePan minDistance={7} maxDistance={20} /></Canvas></div>
    <div className="flex flex-wrap gap-2">{c.stars.map(([name]) => <button className={button} key={name} aria-pressed={selected === name} onClick={() => setSelected(name)}>{name}</button>)}</div>
    <p aria-live="polite" className="text-sm text-cyan-700 dark:text-cyan-200">{selected ? `Tanlangan yulduz: ${selected}. ` : ''}{c.note}</p>
    <p className="text-xs leading-5 text-subtle">Yerdan ko‘rinadigan shaklning soddalashtirilgan chizmasi. Yulduzlar fazoda har xil masofada; ularni bog‘lovchi chiziqlar tasavvuriy.</p>
  </div>;
}

export default function AstronomyLab({isDark,clockTime,onDateChange,speed,onSpeedChange,onClose}) {
  const [tab,setTab] = useState('time');
  return <section role="region" aria-label="Astronomiya laboratoriyasi" className={`pointer-events-auto absolute bottom-24 right-4 top-56 z-40 w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-cyan-400/30 p-4 shadow-2xl backdrop-blur-xl sm:right-6 sm:p-5 ${isDark ? 'bg-panel/95 text-main' : 'bg-panel/95 text-main'}`}>
    <div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-lg font-bold">Astronomiya laboratoriyasi</h2><button className={button} onClick={onClose} aria-label="Laboratoriyani yopish"><X size={18} /></button></div>
    <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Tajriba turi">{[['time','Vaqt mashinasi'],['compare','Taqqoslash'],['eclipse','Tutilish'],['constellations','Yulduz turkumlari']].map(([id,label]) => <button key={id} id={`tab-${id}`} role="tab" aria-selected={tab===id} aria-controls="lab-panel" onClick={() => setTab(id)} className={`${button} ${tab===id ? 'border-cyan-300 bg-cyan-400/20 text-cyan-700 dark:text-cyan-200' : ''}`}>{label}</button>)}</div>
    <div id="lab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
      {tab === 'time' && <div className="space-y-5"><p className="text-sm text-muted">Sayyoralar harakatini oldinga yoki orqaga aylantiring. Tanlangan sana barcha sayyoralarga bir vaqtda qo‘llanadi.</p><label className="block text-sm">Sana (UTC)<input type="date" min="1800-01-01" max="2050-12-31" className={`${input} mt-2`} value={new Date(clockTime).toISOString().slice(0,10)} onChange={e => onDateChange(e.target.value)} /></label><label className="block text-sm">Tezlik<select className={`${input} mt-2`} value={speed} onChange={e => onSpeedChange(Number(e.target.value))}>{[-365,-30,-1,.1,1,10,30,365].map(s => <option key={s} value={s}>{s} kun / soniya</option>)}</select></label><p className="rounded-xl bg-cyan-400/10 p-3 text-sm text-cyan-700 dark:text-cyan-200">{new Date(clockTime).toISOString().slice(0,19).replace('T',' ')} UTC</p><button className={button} onClick={() => onDateChange(new Date().toISOString().slice(0,10))}>Bugungi sana</button><p className="text-xs leading-5 text-subtle">1800–2050: sakkiz sayyora uchun JPL Kepler modeli, taxminiy holat. Yer modeli Yer–Oy massa markaziga asoslangan. Orbitalar va jismlar o‘lchamlari ko‘rgazmali masshtabda. Mitti sayyoralar va yo‘ldoshlar harakati o‘quv animatsiyasi. <a className="text-cyan-700 dark:text-cyan-300 underline" href="https://ssd.jpl.nasa.gov/planets/approx_pos.html" target="_blank" rel="noreferrer">Hisoblash manbasi</a></p></div>}
      {tab === 'compare' && <ComparePlanets />}
      {tab === 'eclipse' && <EclipseSimulator />}
      {tab === 'constellations' && <Constellations />}
    </div>
  </section>;
}
