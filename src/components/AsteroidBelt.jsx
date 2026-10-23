import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { createAsteroids } from '../data/asteroidBelt';
import { DAY, J2000 } from '../data/orbitalMath';

export default function AsteroidBelt({ simulationTimeRef }) {
  const meshRef=useRef();
  const groupRef=useRef();
  const asteroids=useMemo(() => createAsteroids(),[]);
  useLayoutEffect(() => {
    const transform=new THREE.Object3D();
    asteroids.forEach((asteroid,index) => {
      transform.position.set(...asteroid.position);
      transform.rotation.set(...asteroid.rotation);
      transform.scale.set(...asteroid.scale);
      transform.updateMatrix();
      meshRef.current.setMatrixAt(index,transform.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate=true;
    meshRef.current.computeBoundingSphere();
  },[asteroids]);
  useFrame(() => {
    // Educational collective motion, linked to pause, reverse and date controls.
    if(groupRef.current) groupRef.current.rotation.y=((simulationTimeRef.current-J2000)/DAY/(4.6*365.25)%1)*Math.PI*2;
  });
  return <group>
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null,null,asteroids.length]} raycast={() => null}>
        <dodecahedronGeometry args={[1,0]} />
        <meshStandardMaterial color="#a99b86" roughness={1} flatShading emissive="#392b1a" emissiveIntensity={.18} />
      </instancedMesh>
    </group>
    <Html center position={[0,.5,7.7]} distanceFactor={16} style={{pointerEvents:'none'}} zIndexRange={[10,0]}>
      <span className="whitespace-nowrap rounded-lg border border-amber-200/15 bg-black/65 px-2 py-1 text-[10px] text-amber-200">Asteroidlar belbog‘i</span>
    </Html>
  </group>;
}
