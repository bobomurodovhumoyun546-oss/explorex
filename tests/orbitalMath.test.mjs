import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {advanceTime, DAY, MIN_TIME, MAX_TIME, J2000, orbitalPosition, planetNames, solveKepler, eclipseGeometry} from '../src/data/orbitalMath.js';

test('Kepler solver residual across planetary eccentricities', () => {
  for (const e of [0,.0068,.0167,.0934,.2056]) for (const M of [-Math.PI,-2,-.1,0,.2,2,Math.PI]) {
    const E = solveKepler(M,e);
    assert.ok(Math.abs(E-e*Math.sin(E)-M)<1e-10);
  }
});
test('J2000 Earth position and perihelion/aphelion scale', () => {
  const [x,y,z] = orbitalPosition('Yer',J2000);
  assert.ok(Math.abs(x + .17717)<.0001);
  assert.ok(Math.abs(y)<.00001);
  assert.ok(Math.abs(z + .96721)<.0001);
  assert.ok(Math.abs(Math.hypot(...orbitalPosition('Yer',J2000,10,0))-9.8328877)<1e-6);
  assert.ok(Math.abs(Math.hypot(...orbitalPosition('Yer',J2000,10,Math.PI))-10.1671123)<1e-6);
});
test('all supported planets yield finite distinct positions over date range', () => {
  for (const name of planetNames) {
    for (const t of [MIN_TIME,J2000,MAX_TIME]) assert.ok(orbitalPosition(name,t,10).every(Number.isFinite));
    assert.notDeepEqual(orbitalPosition(name,J2000),orbitalPosition(name,J2000+DAY*10));
  }
  assert.equal(orbitalPosition('Serera',J2000),null);
});
test('shared clock supports reverse, fractional speed and stops at bounds', () => {
  assert.equal(advanceTime(J2000,2,10),J2000+20*DAY);
  assert.equal(advanceTime(J2000,2,-10),J2000-20*DAY);
  assert.equal(advanceTime(J2000,1,.1),J2000+.1*DAY);
  assert.equal(advanceTime(MAX_TIME,1,365),MAX_TIME);
  assert.equal(advanceTime(MIN_TIME,1,-365),MIN_TIME);
});
test('eclipse presets and non-alignment', () => {
  assert.equal(eclipseGeometry(0,0).kind,'solar');
  assert.equal(eclipseGeometry(180,0).kind,'lunar');
  assert.equal(eclipseGeometry(90,0).kind,'none');
  assert.equal(eclipseGeometry(270,5.1).kind,'none');
  assert.ok(Math.abs(Math.hypot(...eclipseGeometry(123,5.1).moon)-3)<1e-10);
});
test('bundled map includes Uzbekistan and enough selectable Oceania countries', () => {
  const map = JSON.parse(readFileSync(new URL('../src/data/worldCountries.json',import.meta.url),'utf8'));
  const ids = new Set(map.objects.countries.geometries.map(g => String(g.id).padStart(3,'0')));
  assert.ok(ids.has('860'));
  assert.ok(['036','554','598','242','090','548','882','776','296','520','798','584','583','585'].filter(id=>ids.has(id)).length>=5);
});
