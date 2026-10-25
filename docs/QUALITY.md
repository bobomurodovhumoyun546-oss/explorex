# ExploreX: tekshirish va ma’lumotlar

## Ishga tushirish

```sh
npm install
npm run dev
```

## Tekshiruvlar

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

`test:e2e` avval saytni build qiladi, keyin production preview orqali desktop va telefon ekranlarida Chromium sinovlarini bajaradi. Alohida build allaqachon tayyor bo‘lsa, `npx playwright test` ishlatish mumkin. Preview uchun 4173-port bo‘sh bo‘lishi kerak.

Hisobot: `npm run test:e2e:report`. Xato bo‘lsa skrinshot va trace `test-results/` ichida saqlanadi. Bu fayllar Git’ga qo‘shilmaydi.

Sinovlar xarita chegaralari va bayroqlar, mahalliy rasmlar, davlat paneli, telefon paneli o‘lchami, Esc bilan qaytish, o‘zbekcha qidiruv, bitta urinishli o‘yin, Time Atlas qatlam sanasi va 5/10/20 savollik rekordlarni tekshiradi. Jonli Wikidata so‘rovi brauzer sinovlarida bloklanadi: saqlangan nusxa bilan sayt ishlashi tekshiriladi, tashqi xizmatga yuk tushirilmaydi.

## Ma’lumotlarning sanasi

- Davlat ma’lumotlari: `public/data/countries.json`; manba, olingan sana va tuzatishlar `countries-SOURCE.json` ichida.
- To‘plam yuklangan sana aholi baholangan yil degani emas. Baholangan yil berilmagan bo‘lsa, panel shuni ochiq ko‘rsatadi.
- Rahbarlar: `leaders.json` — sanasi bor saqlangan nusxa; sayt bir sessiyada bitta umumiy Wikidata so‘rovi bilan yangilashga urinadi. Xizmat javob bermasa nusxa sanasi ko‘rsatiladi.
- Gerblar turli manba va arxivlardan olingan tasvirlardir; barcha rasmlarning hozirgi rasmiy ko‘rinishga mosligi tasdiqlanmagan. Havolalar va asl manbalar `public/country-media/SOURCE.json` ichida. Yangilashda eski gerbni hozirgi gerb deb belgilamang.
- Time Atlas tanlangan yil bilan chegaralar qatlami yilini alohida ko‘rsatadi. Oraliq yillarga yangi chegaralar yasalmaydi.

## Tezlik

Sahifalar `React.lazy` orqali kerak bo‘lganda yuklanadi. 3D koinot kodi bosh sahifaga yuklanmaydi. Navigatsiya logotiplari 400 px o‘lchamdagi nusxalardir; asl fayllar saqlangan. Windows’da ularni qayta tayyorlash: `./scripts/optimize-logos.ps1`.

Build ogohlantirishidagi katta 3D chunk faqat astronomiya sahifasiga kerak. Uni boshlang‘ich JavaScript hajmi bilan aralashtirmang.

O‘zbekcha davlat, til va valyuta nomlari brauzerning to‘liq bo‘lmagan til ma’lumotlariga bog‘liq emas. `countries.json` yangilanganda lug‘atni Node’ning to‘liq ICU ma’lumotlaridan qayta yarating: `node scripts/build-geography-translations.mjs`.
