export const telescopeImages = [
  { id:'webb-cliffs', telescope:'Webb', title:'Kosmik qoyalar', object:'Karina tumanligi', year:2022, image:'/telescope/webb-cliffs.png', credit:'NASA, ESA, CSA, STScI', description:'NIRCam tasvirida gaz va chang orasidagi yulduz shakllanish hududi ko‘rinadi. Ko‘rinmas infraqizil nurlanish tasvirda ranglar bilan ifodalangan.', sourceUrl:'https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/' },
  { id:'webb-pillars', telescope:'Webb', title:'Yaratilish ustunlari', object:'Burgut tumanligi · M16', year:2022, image:'/telescope/webb-pillars.png', credit:'NASA, ESA, CSA, STScI', description:'Webbning yaqin infraqizil tasvirida chang ustunlari orasidagi ko‘plab yulduzlarni ko‘rish mumkin.', sourceUrl:'https://science.nasa.gov/asset/webb/pillars-of-creation-nircam-image/' },
  { id:'webb-quintet', telescope:'Webb', title:'Stefan kvinteti', object:'Galaktikalar guruhi · HCG 92', year:2022, image:'/telescope/webb-quintet.png', credit:'NASA, ESA, CSA, STScI', description:'NIRCam va MIRI ma’lumotlaridan tuzilgan ushbu tasvir galaktikalarning yorqin yadrolari, chang va cho‘zilgan tuzilmalarni ochib beradi.', sourceUrl:'https://science.nasa.gov/asset/webb/stephans-quintet-nircam-and-miri-composite-image/' },
  { id:'webb-ring', telescope:'Webb', title:'Janubiy halqa tumanligi', object:'NGC 3132', year:2022, image:'/telescope/webb-ring.png', credit:'NASA, ESA, CSA, STScI', description:'Yulduz atrofidagi gaz va chang qobiqlari Webbning NIRCam tasvirida halqasimon ko‘rinadi.', sourceUrl:'https://science.nasa.gov/asset/webb/southern-ring-nebula-nircam-image/' },
  { id:'hubble-m51', telescope:'Hubble', title:'Girdob galaktikasining markazi', object:'Whirlpool · M51', year:1996, image:'/telescope/hubble-m51.jpg', credit:'Nino Panagia (STScI/ESA), NASA', description:'Hubble suratida M51 galaktikasining markaziy hududi va uning atrofidagi yulduz avlodlari tasvirlangan.', sourceUrl:'https://science.nasa.gov/asset/hubble/the-whirlpool-galaxy-m51/' },
  { id:'hubble-pillars', telescope:'Hubble', title:'Yaratilish ustunlari: ikki davr', object:'Burgut tumanligi · M16', year:2015, image:'/telescope/hubble-pillars.jpg', credit:'NASA, ESA, Hubble Heritage Team (STScI/AURA)', description:'Hubble’ning 1995 va 2014-yillardagi kuzatuvlari yonma-yon. Ushbu taqqoslash 2015-yilda e’lon qilingan.', sourceUrl:'https://science.nasa.gov/missions/hubble/hubble-goes-high-definition-to-revisit-iconic-pillars-of-creation/' },
];

export function filterTelescopeImages(telescope, query) {
  const text = query.trim().toLocaleLowerCase();
  return telescopeImages.filter(image => (telescope === 'all' || image.telescope === telescope)
    && `${image.title} ${image.object} ${image.telescope}`.toLocaleLowerCase().includes(text));
}
