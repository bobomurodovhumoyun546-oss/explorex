// Educational layout: distances and sizes are compressed independently, not an ephemeris.
export const COSMIC_MAX_DISTANCE = 65000;
export const COSMIC_FAR = 180000;
export const cosmicViews = [
  { id:'solar', label:'Quyosh tizimi', distance:55 },
  { id:'stars', label:'Yulduzlar', distance:650 },
  { id:'galaxies', label:'Galaktikalar', distance:35000 },
];

export const deepSpaceData = [
  { id:'milky-way', name:'Somon Yo‘li', aliases:['Milky Way'], kind:'galaxies', type:'Spiral galaktika', position:[900,0,0], visualSize:1400, color:'#96bfff', seed:11, description:'Quyosh tizimi joylashgan galaktika. Ko‘rinishda spiral yenglar va markaziy yadro ajratilgan.', facts:['Quyosh tizimi galaktika markazida emas.','Markazida Sagittarius A* qora tuynugi joylashgan.'], sourceUrl:'https://science.nasa.gov/wp-content/uploads/2023/10/Color_The_Universe_hires.pdf' },
  { id:'andromeda', name:'Andromeda (M31)', aliases:['Andromeda','M31'], kind:'galaxies', type:'Spiral galaktika', position:[5500,600,-4200], visualSize:1100, color:'#b4a4ff', seed:29, distance:'Taxminan 2,5 mln yorug‘lik yili', description:'Somon Yo‘lining yirik spiral qo‘shnilaridan biri. Yorqin yadro va spiral yenglari ko‘rgazmali tasvirlangan.', sourceUrl:'https://www.nasa.gov/missions/chandra/andromeda-galaxy-vibaj/' },
  { id:'m87', name:'Messier 87 (M87)', aliases:['M87','Virgo A'], kind:'galaxies', type:'Elliptik galaktika', position:[15000,1300,6000], visualSize:750, color:'#ffd6a0', seed:47, elliptical:true, description:'Virgo klasterining yirik elliptik galaktikasi. Markazida M87* qora tuynugi mavjud.', sourceUrl:'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-87/' },
  { id:'sagittarius-a', name:'Sagittarius A*', aliases:['Sgr A','qora tuynuk'], kind:'blackholes', type:'Supermassiv qora tuynuk', position:[900,0,0], visualSize:12, color:'#ffad52', description:'Somon Yo‘li markazidagi qora tuynuk. Qora markaz va yorug‘ akkretsiya halqasi o‘quv tasviri sifatida berilgan.', facts:['Qora tuynukning o‘zi yorug‘lik chiqarmaydi.','Yorqin disk uning atrofidagi qizigan moddani ifodalaydi.'], sourceUrl:'https://www.jpl.nasa.gov/edu/resources/teachable-moment/how-scientists-captured-the-first-image-of-a-black-hole/' },
  { id:'m87-black-hole', name:'M87*', aliases:['M87 black hole'], kind:'blackholes', type:'Supermassiv qora tuynuk', position:[15000,1300,6000], visualSize:25, color:'#ff8745', description:'M87 galaktikasi markazidagi qora tuynuk. Halqa va qutbiy oqimlar uning atrofidagi faol muhitni ko‘rsatadi.', sourceUrl:'https://www.jpl.nasa.gov/edu/resources/teachable-moment/how-scientists-captured-the-first-image-of-a-black-hole/' },
];

export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state,1664525)+1013904223) >>> 0; return state/4294967296; };
}

export function galaxyParticles(radius, seed, count=9000, elliptical=false) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count*3);
  const colors = new Float32Array(count*3);
  for (let i=0;i<count;i++) {
    const bulge = random() < (elliptical ? 1 : .2);
    const halo = !bulge && random() < .08;
    const u = Math.pow(random(), bulge ? 1.8 : .7);
    const r = u * radius * (bulge && !elliptical ? .26 : .98);
    const angle = bulge || halo ? random()*Math.PI*2
      : (i%4)*Math.PI/2 + 2.6*Math.log(1+u*4) + (random()+random()+random()-1.5)*(.12+u*.34);
    if (bulge || halo) {
      const elevation = random()*2-1;
      const ring = Math.sqrt(1-elevation*elevation);
      positions.set([Math.cos(angle)*r*ring,elevation*r*(elliptical?.62:.5),Math.sin(angle)*r*ring*(elliptical?.8:1)],i*3);
    } else {
      positions.set([Math.cos(angle)*r,(random()-.5)*radius*.045*(1-u+.12),Math.sin(angle)*r],i*3);
    }
    const warmth = bulge || halo ? .85 : Math.max(0,1-u*2.4);
    const starForming = !bulge && !halo && random()<.055;
    colors.set(starForming ? [1,.35,.57] : [.5+warmth*.5,.65+warmth*.19,1-warmth*.48],i*3);
  }
  return {positions,colors};
}
