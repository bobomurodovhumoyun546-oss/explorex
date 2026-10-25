import { test, expect } from '@playwright/test';

test.beforeEach(async ({page}) => {
  // An unavailable live source must not break the local country information.
  await page.route('https://query.wikidata.org/**', route => route.abort());
});

async function mapReady(page) {
  await page.goto('/geography/map');
  await expect(page.locator('.rsm-geography')).toHaveCount(177);
  await expect(page.getByText('Davlatlar yuklanmoqda...', {exact:true})).toBeHidden({timeout:45000});
  await expect(page.getByRole('button', {name: 'O‘zbekiston bayrog‘i', exact: true})).toBeVisible();
}

async function openUzbekistan(page) {
  await page.getByRole('button', {name: 'O‘zbekiston bayrog‘i', exact: true}).click();
  const panel = page.getByRole('region', {name: 'O‘zbekiston — davlat ma’lumotlari'});
  await expect(panel).toBeVisible();
  return panel;
}

async function clickCountryShape(page, name) {
  const shape = page.locator(`path.rsm-geography[aria-label="${name}"]`);
  await shape.scrollIntoViewIfNeeded();
  // Irregular countries need not contain the center of their bounding box.
  // Pick a real visible point inside the SVG shape instead of forcing a click.
  const point = await shape.evaluate(element => {
    const box = element.getBBox();
    for (const x of [.5,.3,.7,.1,.9]) for (const y of [.5,.3,.7,.1,.9]) {
      const local = new DOMPoint(box.x + box.width * x, box.y + box.height * y);
      const screen = local.matrixTransform(element.getScreenCTM());
      if (element.isPointInFill(local) && document.elementFromPoint(screen.x,screen.y) === element) return {x:screen.x,y:screen.y};
    }
    return null;
  });
  expect(point).not.toBeNull();
  await page.mouse.click(point.x,point.y);
}

test('home loads without the astronomy or world map bundles', async ({page}, testInfo) => {
  const scripts = [];
  const payloads = [];
  page.on('request', request => { if (request.resourceType() === 'script') scripts.push(request.url()); });
  page.on('response', response => { if (response.request().resourceType() === 'script') payloads.push(response.body().then(body => body.length)); });
  await page.goto('/');
  await expect(page.getByRole('heading', {level:1})).toBeVisible();
  expect(scripts.some(url => /\/(Astronomy|Stars|WorldMap|TimeAtlas|worldCountries)-/.test(url))).toBe(false);
  const bytes = (await Promise.all(payloads)).reduce((sum, size) => sum + size, 0);
  testInfo.annotations.push({type:'initial-js-bytes',description:String(bytes)});
  expect(bytes).toBeLessThan(600000);
});

test('a failed lazy page shows recovery controls and can return to home', async ({page}) => {
  await page.route('**/assets/WorldMap-*.js', route => route.abort());
  await page.goto('/geography/map');
  const error = page.getByRole('alert');
  await expect(error.getByRole('heading', {name:'Sahifani ochib bo‘lmadi'})).toBeVisible();
  await expect(error.getByRole('button', {name:'Qayta yuklash'})).toBeVisible();
  await error.getByRole('link', {name:'Bosh sahifaga qaytish'}).click();
  await expect(page.getByRole('heading', {level:1})).toBeVisible();
  await expect(error).toHaveCount(0);
});

test('failed country data can be retried without reloading the map', async ({page}) => {
  let fail = true;
  await page.route(/\/data\/countries\.json(?:\?|$)/, route => {
    if (fail) { fail = false; return route.fulfill({status:503,body:'unavailable'}); }
    return route.continue();
  });
  await page.goto('/geography/map');
  await expect(page.locator('.rsm-geography')).toHaveCount(177);
  await page.getByRole('alert').getByRole('button', {name:'Qayta urinish'}).click();
  await expect(page.getByRole('button', {name:'O‘zbekiston bayrog‘i',exact:true})).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('country polygons and flags open the same local details with estimated population', async ({page}, testInfo) => {
  await mapReady(page);
  await page.getByRole('checkbox', {name:'Bayroqlar',exact:true}).uncheck();
  await clickCountryShape(page, 'O‘zbekiston');
  let panel = page.getByRole('region', {name: 'O‘zbekiston — davlat ma’lumotlari'});
  await expect(panel).toBeVisible();
  for (const label of ['Bayrog‘i', 'Gerbi / davlat ramzi']) {
    const img = panel.getByRole('img', {name:label, exact:true});
    await expect(img).toBeVisible();
    await expect.poll(() => img.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await expect(panel.getByText('+998', {exact:true})).toBeVisible();
  await expect(panel.getByText(/Taxminan .* kishi/)).toBeVisible();
  await expect(panel.getByText('Toshkent', {exact:true})).toBeVisible();
  if (testInfo.project.name === 'mobile') {
    const box = await panel.boundingBox();
    expect(box.height).toBeLessThanOrEqual(page.viewportSize().height * .59);
    expect(box.y).toBeGreaterThan(page.viewportSize().height * .39);
    const map = await page.locator('[data-map-canvas] > svg').boundingBox();
    expect(map.y).toBeGreaterThanOrEqual(60);
    expect(map.y + map.height).toBeLessThanOrEqual(box.y + 8);
  }
  await page.screenshot({path:testInfo.outputPath('country-panel.png')});
  await panel.getByRole('button', {name:'Davlat ma’lumotlarini yopish'}).click();
  await page.getByRole('checkbox', {name:'Bayroqlar',exact:true}).check();
  panel = await openUzbekistan(page);
  await panel.getByText('Ma’lumot sanalari va aniqligi').click();
  await expect(panel.getByText(/Aholi baholangan yil: manbada ko‘rsatilmagan/)).toBeVisible();
  await expect(panel.getByText(/Ma’lumot to‘plami olingan sana:/)).toBeVisible();
});

test('full map keeps country selection, closes the panel before exiting and restores navbar', async ({page}, testInfo) => {
  await mapReady(page);
  await page.getByRole('button', {name:'Butun xarita', exact:true}).click();
  await expect(page.locator('nav')).toHaveCount(0);
  const panel = await openUzbekistan(page);
  if (testInfo.project.name === 'mobile') {
    const sheet = await panel.boundingBox();
    const map = await page.locator('[data-map-canvas] > svg').boundingBox();
    expect(map.y + map.height).toBeLessThanOrEqual(sheet.y + 8);
  }
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(page.getByRole('button', {name:'Orqaga',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', {name:'Butun xarita', exact:true})).toBeVisible();
  await expect(page.locator('nav')).toBeVisible();
});

test('Uzbek search accepts keyboard apostrophes and translated capital names', async ({page}) => {
  await mapReady(page);
  const search = page.getByPlaceholder('Davlat yoki poytaxtni qidiring...');
  await search.fill("O'zbekiston");
  await expect(page.getByRole('button', {name:'O‘zbekiston bayrog‘i',exact:true})).toBeVisible();
  await expect(page.locator('.rsm-marker')).toHaveCount(1);
  await search.fill('Toshkent');
  await expect(page.locator('.rsm-marker')).toHaveCount(1);
});

test('country challenge keeps timer, single attempt and automatic advance in full map', async ({page}) => {
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});
  await page.goto('/geography/challenge');
  await expect(page.getByRole('button', {name:/Osiyo.*Tanlash/})).toBeVisible();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await page.getByRole('button', {name:/Osiyo.*Tanlash/}).click();
  await page.getByRole('button', {name:/5 ta/}).click();
  await page.getByRole('button', {name:'Butun xarita',exact:true}).click();
  const controls = page.getByRole('region', {name:'To‘liq xaritadagi o‘yin'});
  await expect(controls.getByRole('heading')).toBeVisible();
  await expect(controls.getByRole('timer')).toBeVisible();
  await page.getByRole('button', {name:'China',exact:true}).click();
  await expect(controls.getByRole('status')).toBeVisible();
  const colors = await page.locator('.rsm-geography').evaluateAll(paths => paths.map(path => path.getAttribute('fill')));
  expect(colors).toContain('#34d399');
  await page.getByRole('button', {name:'India',exact:true}).click();
  expect(await page.locator('.rsm-geography').evaluateAll(paths => paths.map(path => path.getAttribute('fill')))).toEqual(colors);
  await expect(page.getByRole('button', {name:'Keyingi savol'})).toHaveCount(0);
  await page.clock.runFor(2000);
  await expect(controls.getByText(/Savol 2\/5/)).toBeVisible();
  await expect(controls.getByRole('status')).toHaveCount(0);
});

test('Time Atlas discloses snapshot date and supports full map', async ({page}) => {
  await page.goto('/geography/time-atlas');
  await page.getByRole('spinbutton', {name:'Yilni kiriting'}).fill('2026');
  await page.getByRole('spinbutton', {name:'Yilni kiriting'}).press('Enter');
  await expect(page.getByRole('status').filter({hasText:'Tanlangan yil:'})).toContainText('Chegaralar qatlami: 2010');
  await expect(page.locator('.rsm-marker').first()).toBeVisible();
  await page.getByRole('button', {name:'Butun xarita',exact:true}).click();
  await expect(page.locator('nav')).toHaveCount(0);
  await expect(page.getByRole('region', {name:'Xarita sanasi'})).toContainText('2010');
  await expect(page.locator('.rsm-geography').first()).toBeVisible();
  await page.getByRole('button', {name:'Orqaga',exact:true}).click();
  await expect(page.locator('nav')).toBeVisible();
});

test('flag quiz supports 5, 10 and 20 questions and saves each mode separately', async ({page}) => {
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});
  await page.goto('/geography/flags');
  await expect(page.getByRole('button', {name:'O‘yinni boshlash'})).toBeVisible();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  for (const count of [5,10,20]) {
    await page.getByRole('button', {name:`${count} ta`,exact:true}).click();
    await page.getByRole('button', {name:'O‘yinni boshlash'}).click();
    for (let index = 0; index < count; index++) {
      await expect(page.getByText(`Savol ${index + 1}/${count}`,{exact:true})).toBeVisible();
      const help = page.getByRole('button', {name:/50\/50/});
      const options = page.locator('[aria-label="Javob variantlari"] button');
      if (index === 0) {
        await expect(help).toBeEnabled();
        await help.click();
        await expect(options).toHaveCount(2);
      } else {
        await expect(help).toBeDisabled();
        await expect(options).toHaveCount(4);
      }
      await options.first().click();
      await expect(page.getByRole('status')).toBeVisible();
      await page.clock.runFor(2000);
    }
    await expect(page.getByText('O‘yin yakunlandi!',{exact:true})).toBeVisible();
    await page.getByRole('button', {name:'Savollar sonini o‘zgartirish'}).click();
  }
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('explorex.flagQuiz.records.v1')).map(record => record.total).sort((a,b)=>a-b))).toEqual([5,10,20]);
});
