import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {COSMIC_FAR, COSMIC_MAX_DISTANCE, cosmicViews, deepSpaceData, galaxyParticles} from '../src/data/deepSpaceData.js';

test('expanded camera can show every cosmic object from galaxy overview', () => {
  const camera = new THREE.PerspectiveCamera(55, 16/9, .1, COSMIC_FAR);
  camera.position.copy(new THREE.Vector3(0,35,45).normalize().multiplyScalar(cosmicViews.at(-1).distance));
  camera.lookAt(0,0,0);
  camera.updateMatrixWorld();
  for(const object of deepSpaceData) {
    const projected = new THREE.Vector3(...object.position).project(camera);
    assert.ok(Math.abs(projected.x)<1 && Math.abs(projected.y)<1 && projected.z<1, object.name);
    assert.ok(object.visualSize*6<COSMIC_MAX_DISTANCE);
  }
  assert.ok(cosmicViews.every(view => view.distance<=COSMIC_MAX_DISTANCE));
  assert.ok(COSMIC_FAR>COSMIC_MAX_DISTANCE*2);
});

test('catalog includes galaxies and black holes with finite positions', () => {
  for (const kind of ['galaxies','blackholes']) assert.ok(deepSpaceData.filter(object=>object.kind===kind).length>=2);
  assert.equal(new Set(deepSpaceData.map(object=>object.name)).size,deepSpaceData.length);
  for(const object of deepSpaceData) assert.ok(object.position.length===3 && object.position.every(Number.isFinite));
});

test('galaxy particles are deterministic, bounded and suitable for buffer geometry', () => {
  const a=galaxyParticles(1400,11,1000);
  const b=galaxyParticles(1400,11,1000);
  assert.deepEqual(a,b);
  assert.equal(a.positions.length,3000);
  assert.ok(a.positions.every(Number.isFinite));
  assert.ok(a.colors.every(value=>value>=0 && value<=1));
  for(let i=0;i<a.positions.length;i+=3) assert.ok(Math.hypot(...a.positions.slice(i,i+3))<1450);
});
