// JPL Table 1: https://ssd.jpl.nasa.gov/planets/approx_pos.html
// a, e, I, L, perihelion, node; second row: change per Julian century.
export const DAY = 86400000;
export const MIN_TIME = Date.UTC(1800, 0, 1);
export const MAX_TIME = Date.UTC(2050, 11, 31);
export const J2000 = Date.UTC(2000, 0, 1, 12);
const RAD = Math.PI / 180;
const elements = {
  Merkuriy: [[.38709927,.20563593,7.00497902,252.25032350,77.45779628,48.33076593],[.00000037,.00001906,-.00594749,149472.67411175,.16047689,-.12534081]],
  Venera: [[.72333566,.00677672,3.39467605,181.97909950,131.60246718,76.67984255],[.00000390,-.00004107,-.00078890,58517.81538729,.00268329,-.27769418]],
  Yer: [[1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0],[.00000562,-.00004392,-.01294668,35999.37244981,.32327364,0]],
  Mars: [[1.52371034,.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891],[.00001847,.00007882,-.00813131,19140.30268499,.44441088,-.29257343]],
  Yupiter: [[5.202887,.04838624,1.30439695,34.39644051,14.72847983,100.47390909],[-.00011607,-.00013253,-.00183714,3034.74612775,.21252668,.20469106]],
  Saturn: [[9.53667594,.05386179,2.48599187,49.95424423,92.59887831,113.66242448],[-.00125060,-.00050991,.00193609,1222.49362201,-.41897216,-.28867794]],
  Uran: [[19.18916464,.04725744,.77263783,313.23810451,170.95427630,74.01692503],[-.00196176,-.00004397,-.00242939,428.48202785,.40805281,.04240589]],
  Neptun: [[30.06992276,.00859048,1.77004347,-55.12002969,44.96476227,131.78422574],[.00026291,.00005105,.00035372,218.45945325,-.32241464,-.00508664]],
};
export const planetNames = Object.keys(elements);
export function solveKepler(meanAnomaly, eccentricity) {
  let E = meanAnomaly;
  for (let n = 0; n < 15; n++) {
    const step = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
    E -= step;
    if (Math.abs(step) < 1e-12) break;
  }
  return E;
}
// Returns [ecliptic X, ecliptic Z, -ecliptic Y] for Three.js Y-up.
// Each orbit has its own display scale; angles and eccentricity are preserved.
export function orbitalPosition(name, time, displayRadius, anomalyOverride) {
  const entry = elements[name];
  if (!entry) return null;
  const T = (time - J2000) / DAY / 36525;
  const [a,e,inc,L,peri,node] = entry[0].map((v,i) => v + entry[1][i] * T);
  const M = anomalyOverride ?? (((L - peri) % 360) * RAD);
  const E = solveKepler(M,e);
  const x = a * (Math.cos(E) - e), y = a * Math.sqrt(1-e*e) * Math.sin(E);
  const w = (peri-node)*RAD, O = node*RAD, I = inc*RAD;
  const X = (Math.cos(w)*Math.cos(O)-Math.sin(w)*Math.sin(O)*Math.cos(I))*x + (-Math.sin(w)*Math.cos(O)-Math.cos(w)*Math.sin(O)*Math.cos(I))*y;
  const Y = (Math.cos(w)*Math.sin(O)+Math.sin(w)*Math.cos(O)*Math.cos(I))*x + (-Math.sin(w)*Math.sin(O)+Math.cos(w)*Math.cos(O)*Math.cos(I))*y;
  const Z = Math.sin(w)*Math.sin(I)*x + Math.cos(w)*Math.sin(I)*y;
  const scale = displayRadius === undefined ? 1 : displayRadius/a;
  return [X*scale,Z*scale,-Y*scale];
}
export function advanceTime(time, seconds, daysPerSecond) {
  return Math.min(MAX_TIME, Math.max(MIN_TIME, time + seconds * daysPerSecond * DAY));
}
// Teaching geometry: Sun at -8, Earth at 0; Moon orbits Earth.
export function eclipseGeometry(phaseDegrees, tiltDegrees) {
  const a = phaseDegrees * RAD, tilt = tiltDegrees * RAD;
  const moon = [-3*Math.cos(a), 3*Math.sin(a)*Math.sin(tilt), 3*Math.sin(a)*Math.cos(tilt)];
  const solarOffset = Math.hypot(moon[1],moon[2]) * 8 / (moon[0]+8);
  const lunarOffset = Math.hypot(moon[1],moon[2]);
  const kind = moon[0] < 0 && solarOffset < 1.27 ? 'solar' : moon[0] > 0 && lunarOffset < .9 ? 'lunar' : 'none';
  return { moon, kind };
}
