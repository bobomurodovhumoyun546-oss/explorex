import { seededRandom } from './deepSpaceData.js';
// Display units: Mars 6.5, Ceres 7.5, Jupiter 9.
export const BELT_INNER_RADIUS = 7.05;
export const BELT_OUTER_RADIUS = 8.35;
export function createAsteroids(count = 2200, seed = 713) {
  const random = seededRandom(seed);
  return Array.from({length:count}, () => {
    const angle=random()*Math.PI*2;
    const radius=BELT_INNER_RADIUS+random()*(BELT_OUTER_RADIUS-BELT_INNER_RADIUS);
    const size=.012+Math.pow(random(),3)*.035;
    return {
      position:[Math.cos(angle)*radius,(random()-.5)*.32,Math.sin(angle)*radius],
      rotation:[random()*Math.PI,random()*Math.PI,random()*Math.PI],
      scale:[size,size*(.6+random()*.6),size*(.7+random()*.8)],
    };
  });
}
