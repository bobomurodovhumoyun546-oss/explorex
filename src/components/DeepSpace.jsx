import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import { deepSpaceData, galaxyParticles } from '../data/deepSpaceData';

const vertexShader = `
  attribute vec3 color;
  varying vec3 vColor;
  uniform float pointSize;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(pointSize * 350.0 / max(1.0,-mv.z),0.65,8.0);
  }
`;
const fragmentShader = `
  varying vec3 vColor;
  uniform float opacity;
  void main() {
    float r = length(gl_PointCoord - vec2(0.5))*2.0;
    if(r > 1.0) discard;
    float glow = exp(-r*r*5.0)*(1.0-smoothstep(0.65,1.0,r));
    gl_FragColor = vec4(vColor, glow*opacity);
  }
`;

const glowVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;
const diskFragmentShader = `
  varying vec2 vUv;
  uniform float opacity;
  uniform float seed;
  float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7))+seed)*43758.5453); }
  float noise(vec2 p) {
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  void main() {
    vec2 p=(vUv-.5)*2.3;
    float r=length(p);
    if(r>1.08) discard;
    float angle=atan(-p.y,p.x);
    float phase=4.0*(angle-2.6*log(1.0+r*4.0));
    float cloud=noise(p*23.0)*.55+noise(p*57.0)*.3+noise(p*130.0)*.15;
    float arms=pow(.5+.5*cos(phase+(cloud-.5)*1.3),5.0);
    float dust=pow(max(0.0,cos(phase+.45)),14.0)*smoothstep(.12,.3,r);
    float taper=exp(-r*2.3)*(1.0-smoothstep(.75,1.08,r));
    float density=(.08+arms*.85)*taper*(.35+cloud*.9)*(1.0-dust*.88);
    vec3 color=mix(vec3(.28,.42,.7),vec3(.95,.72,.43),exp(-r*8.0));
    color=mix(color,vec3(.85,.33,.5),arms*smoothstep(.68,.9,cloud)*.4);
    gl_FragColor=vec4(color,density*opacity*.65);
  }
`;
const coreFragmentShader = `
  varying vec2 vUv;
  uniform float opacity;
  uniform float elliptical;
  void main() {
    float r=length((vUv-.5)*2.0);
    float core=exp(-r*r*22.0);
    float halo=exp(-r*r*5.5)*.3;
    float alpha=(core*.6+halo)*(1.0-smoothstep(.65,1.0,r));
    vec3 color=mix(vec3(.7,.5,.3),vec3(1.0,.91,.72),core);
    gl_FragColor=vec4(color,alpha*opacity*mix(1.0,.85,elliptical));
  }
`;

function Galaxy({ radius, seed, elliptical=false, count=9000, fadeInside=false }) {
  const materialRef = useRef();
  const diskRef = useRef();
  const coreRef = useRef();
  const groupRef = useRef();
  const center = useMemo(() => new THREE.Vector3(),[]);
  const data = useMemo(() => galaxyParticles(radius,seed,count,elliptical),[radius,seed,count,elliptical]);
  const uniforms = useMemo(() => ({pointSize:{value:radius*.012},opacity:{value:.9}}),[radius]);
  const glowUniforms = useMemo(() => ({opacity:{value:.9},seed:{value:seed},elliptical:{value:elliptical?1:0}}),[seed,elliptical]);
  useFrame(({camera}) => {
    if (fadeInside && groupRef.current && materialRef.current) {
      groupRef.current.getWorldPosition(center);
      const fade=THREE.MathUtils.clamp((camera.position.distanceTo(center)/radius-.65)/1.1,0,.9);
      materialRef.current.uniforms.opacity.value=fade;
      if(diskRef.current) diskRef.current.uniforms.opacity.value=fade;
      if(coreRef.current) coreRef.current.uniforms.opacity.value=fade;
    }
  });
  return <group ref={groupRef}>
    {!elliptical && <mesh rotation={[-Math.PI/2,0,0]} raycast={() => null}>
      <planeGeometry args={[radius*2.3,radius*2.3]} />
      <shaderMaterial ref={diskRef} uniforms={glowUniforms} vertexShader={glowVertexShader} fragmentShader={diskFragmentShader} side={THREE.DoubleSide} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>}
    <Billboard><mesh raycast={() => null}>
      <planeGeometry args={[radius*(elliptical?1.65:.55),radius*(elliptical?1.25:.4)]} />
      <shaderMaterial ref={coreRef} uniforms={glowUniforms} vertexShader={glowVertexShader} fragmentShader={coreFragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh></Billboard>
    <points raycast={() => null}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[data.positions,3]} />
      <bufferAttribute attach="attributes-color" args={[data.colors,3]} />
    </bufferGeometry>
    <shaderMaterial ref={materialRef} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  </group>;
}

function BlackHole({ object }) {
  const diskRef = useRef();
  const r=object.visualSize;
  useFrame((_,delta) => { if(diskRef.current) diskRef.current.rotation.z += delta*.12; });
  return <group rotation={[.35,0,.2]}>
    <mesh><sphereGeometry args={[r,48,48]} /><meshBasicMaterial color="#000002" /></mesh>
    <group ref={diskRef} rotation={[-Math.PI/2,0,0]}>
      <mesh><ringGeometry args={[r*1.28,r*2.7,96]} /><meshBasicMaterial color={object.color} side={THREE.DoubleSide} transparent opacity={.8} /></mesh>
      <mesh><ringGeometry args={[r*1.08,r*1.2,96]} /><meshBasicMaterial color="#fff0cc" side={THREE.DoubleSide} /></mesh>
      <mesh><ringGeometry args={[r*2.7,r*3.8,96]} /><meshBasicMaterial color="#f97316" side={THREE.DoubleSide} transparent opacity={.12} depthWrite={false} /></mesh>
    </group>
    {object.id==='m87-black-hole' && [-1,1].map(sign => <mesh key={sign} position={[0,sign*r*4,0]}><coneGeometry args={[r*.35,r*6,20]} /><meshBasicMaterial color="#a5e7ff" transparent opacity={.4} depthWrite={false} /></mesh>)}
  </group>;
}

function CosmicObject({ object,onSelect,positionsRef }) {
  const labelRef=useRef();
  const world=useMemo(() => new THREE.Vector3(...object.position),[object]);
  useFrame(({camera,controls}) => {
    if(!labelRef.current) return;
    const viewDistance=controls ? camera.position.distanceTo(controls.target) : camera.position.length();
    const distance=camera.position.distanceTo(world);
    const visible = object.kind==='blackholes' ? distance<object.visualSize*40 : viewDistance>450 && distance<object.visualSize*25;
    labelRef.current.style.display = visible ? 'block' : 'none';
  });
  return <group position={object.position} ref={element => {if(element) positionsRef.current[object.name]=world;}} onClick={event => {event.stopPropagation();onSelect(object);}}>
    {object.kind==='galaxies' && <>
      <Galaxy radius={object.visualSize} seed={object.seed} elliptical={object.elliptical} fadeInside />
    </>}
    {object.kind==='blackholes' && <BlackHole object={object} />}
    <group position={[0,object.visualSize*(object.kind==='blackholes'?4:1.1),0]}>
      <Html center style={{pointerEvents:'auto'}} zIndexRange={[15,0]}>
        <button ref={labelRef} style={{display:'none'}} onClick={event => {event.stopPropagation();onSelect(object);}} className="whitespace-nowrap rounded-xl border border-white/20 bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-cyan-100 shadow-lg">{object.name}</button>
      </Html>
    </group>
  </group>;
}

export default function DeepSpace({onSelect,positionsRef}) {
  return <group>{deepSpaceData.map(object => <CosmicObject key={object.id} object={object} onSelect={onSelect} positionsRef={positionsRef} />)}</group>;
}
