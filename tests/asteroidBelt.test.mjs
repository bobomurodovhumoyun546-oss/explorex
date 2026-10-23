import test from 'node:test';
import assert from 'node:assert/strict';
import { BELT_INNER_RADIUS, BELT_OUTER_RADIUS, createAsteroids } from '../src/data/asteroidBelt.js';
test('asteroids occupy the display gap between Mars and Jupiter, including Ceres orbit', () => {
  assert.ok(BELT_INNER_RADIUS>6.5+.25 && BELT_OUTER_RADIUS<9);
  assert.ok(BELT_INNER_RADIUS<7.5 && BELT_OUTER_RADIUS>7.5);
  const asteroids=createAsteroids();
  assert.equal(asteroids.length,2200);
  for(const asteroid of asteroids) {
    const radius=Math.hypot(asteroid.position[0],asteroid.position[2]);
    assert.ok(radius>=BELT_INNER_RADIUS && radius<=BELT_OUTER_RADIUS);
    assert.ok(asteroid.position.every(Number.isFinite));
    assert.ok(asteroid.scale.every(value=>value>0 && value<.08));
  }
  assert.deepEqual(createAsteroids(5),createAsteroids(5));
});
