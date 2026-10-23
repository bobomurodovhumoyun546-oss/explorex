export const recordCategories = [
  ['all', 'Barchasi'], ['mountains', 'Tog‘lar'], ['ocean', 'Okeanlar'],
  ['rivers', 'Daryolar'], ['deserts', 'Cho‘llar'], ['lakes', 'Ko‘llar'],
];

// Coordinates mark a representative point; rivers and regions are not point features.
export const earthRecords = [
  { id:'everest', category:'mountains', name:'Everest', title:'Dengiz sathidan eng baland cho‘qqi', value:'8 848,86 m', location:'Nepal va Xitoy chegarasi', coordinates:[86.925,27.988], description:'Himolaydagi eng baland cho‘qqi. Balandlik dengiz sathidan o‘lchanadi; tog‘ poydevoridan o‘lchash boshqa natija beradi.', source:'Guinness World Records', url:'https://www.guinnessworldrecords.com/world-records/highest-mountain' },
  { id:'k2', category:'mountains', name:'K2', title:'Dunyodagi ikkinchi eng baland cho‘qqi', value:'8 611 m', location:'Pokiston va Xitoy chegarasi', coordinates:[76.513,35.881], description:'Qoraqurum tizmasidagi cho‘qqi. Uning balandligi dengiz sathiga nisbatan berilgan.', source:'Guinness World Records', url:'https://www.guinnessworldrecords.com/world-records/665319-first-winter-ascent-of-k2' },
  { id:'kangchenjunga', category:'mountains', name:'Kanchenjunga', title:'Eng baland uch cho‘qqidan biri', value:'8 586 m', location:'Nepal va Hindiston chegarasi', coordinates:[88.148,27.703], description:'Himolay tizmasining sharqidagi ulkan tog‘ massivi. Balandligi dengiz sathidan hisoblanadi.', source:'Nepal hukumati — Mountaineering Facts & Figures', url:'https://giwmscdntwo.gov.np/media/pdf_upload/%E0%A4%AA%E0%A4%B0%E0%A5%8D%E0%A4%B5%E0%A4%A4%E0%A4%BE%E0%A4%B0%E0%A5%8B%E0%A4%B9%E0%A4%A3%20%E0%A4%A4%E0%A4%A5%E0%A5%8D%E0%A4%AF%20%E0%A4%B0%20%E0%A4%9A%E0%A4%BF%E0%A4%A4%E0%A5%8D%E0%A4%B0%20%E0%A5%A8%E0%A5%A6%E0%A5%AE%E0%A5%A8_5wb7u9o.pdf' },
  { id:'challenger', category:'ocean', name:'Challenger Deep', title:'Okeandagi eng chuqur ma’lum nuqta', value:'≈10 935 m', location:'Mariana botig‘i, Tinch okeani', coordinates:[142.2,11.37], description:'Dengiz sathidan pastdagi chuqurlik. Turli o‘lchash usullari bir oz farqli natijalar beradi; bu NOAA keltirgan taxminiy qiymat.', source:'NOAA', url:'https://oceanservice.noaa.gov/facts/oceandepth.html' },
  { id:'pacific', category:'ocean', name:'Tinch okeani', title:'Maydoni eng katta okean', value:'≈162 mln km²', location:'Osiyo, Okeaniya va Amerikalar oralig‘i', coordinates:[-150,0], description:'Yerning eng katta va eng chuqur okean havzasi. Maydon bahosi okean chegaralarining qanday belgilanishiga bog‘liq.', source:'NOAA', url:'https://oceanservice.noaa.gov/facts/biggestocean.html' },
  { id:'nile', category:'rivers', name:'Nil', title:'Eng uzun daryolardan biri', value:'≈6 650 km', location:'Shimoli-sharqiy Afrika', coordinates:[31,20], description:'Ko‘p ma’lumotnomalarda eng uzun daryo deb beriladi. Nil va Amazonka uzunligi manba va quyilish nuqtasini tanlashga bog‘liq; reyting mutlaq emas.', source:'USGS — Rivers of the World', url:'https://www.usgs.gov/water-science-school/science/rivers-world-worlds-longest-rivers' },
  { id:'amazon', category:'rivers', name:'Amazonka', title:'Suv oqimi hajmi eng katta daryo', value:'≈6 400 km uzunlik', location:'Janubiy Amerika', coordinates:[-60,-3.1], description:'Suv oqimi hajmi bo‘yicha dunyoda yetakchi. Ko‘rsatilgan raqam uzunlikning keng tarqalgan taxminiy bahosi; tanlangan boshlanish va quyilish joyiga qarab o‘zgaradi.', source:'USGS — Rivers of the World', url:'https://www.usgs.gov/water-science-school/science/rivers-world-worlds-longest-rivers', extraUrl:'https://education.nationalgeographic.org/resource/understanding-rivers/' },
  { id:'yangtze', category:'rivers', name:'Yanszi', title:'Osiyoning eng uzun daryosi', value:'≈6 300 km', location:'Xitoy', coordinates:[111,30.7], description:'Tibet platosidan boshlanib, sharqqa tomon oqadi. Daryo uzunligi yaxlitlangan; uning manbasini aniqlash usuliga qarab baholar farqlanadi.', source:'UN ESCAP', url:'https://www.unescap.org/sites/default/files/pub_1836_fulltext.pdf' },
  { id:'antarctica', category:'deserts', name:'Antarktida', title:'Dunyodagi eng katta cho‘l', value:'≈14,2 mln km²', location:'Janubiy qutb hududi', coordinates:[20,-78], description:'Cho‘l faqat issiq yoki qumli joy degani emas. Yog‘in nihoyatda kam bo‘lgani uchun muzli Antarktida ham cho‘l hisoblanadi.', source:'National Geographic', url:'https://education.nationalgeographic.org/resource/deserts/' },
  { id:'sahara', category:'deserts', name:'Sahroi Kabir', title:'Eng katta issiq cho‘l', value:'≈9,4 mln km²', location:'Shimoliy Afrika', coordinates:[13,23], description:'Afrikaning shimoliy qismidagi ulkan issiq cho‘l. Antarktida umumiy maydon bo‘yicha kattaroq, lekin qutbiy cho‘l turiga kiradi.', source:'National Geographic', url:'https://education.nationalgeographic.org/resource/deserts/' },
  { id:'baikal', category:'lakes', name:'Baykal', title:'Eng chuqur ko‘l', value:'1 642 m', location:'Sibir, Rossiya', coordinates:[108,53.5], description:'Baykalning eng chuqur o‘lchangan nuqtasi. Ko‘l chuqurligi suv sathidan tubigacha bo‘lgan masofani anglatadi.', source:'Limnologiya instituti', url:'https://srv01.lin.irk.ru/en/news/2289-more-on-the-maximum-depth-of-lake-baikal' },
];

function normalize(value) {
  return value.toLocaleLowerCase().replace(/[‘’ʻʼ']/g, '');
}

export function filterEarthRecords(category, query) {
  const needle = normalize(query.trim());
  return earthRecords.filter(record => (category === 'all' || record.category === category)
    && normalize(`${record.name} ${record.title} ${record.location}`).includes(needle));
}
