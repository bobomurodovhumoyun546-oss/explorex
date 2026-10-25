import {test, expect} from '@playwright/test';
import {flagCountries} from '../../src/data/flagQuiz.js';

test.beforeEach(async ({page}) => {
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});
});

async function freezeTime(page, ready) {
  await expect(ready).toBeVisible();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
}

test('flag timeout reveals the answer, locks choices and advances with a fresh timer', async ({page}) => {
  await page.goto('/geography/flags');
  await freezeTime(page, page.getByRole('button',{name:'O‘yinni boshlash'}));
  await page.getByRole('button', {name:'5 ta',exact:true}).click();
  await page.getByRole('button', {name:'O‘yinni boshlash'}).click();
  const image = page.getByAltText('Qaysi davlatning bayrog‘i?');
  const code = (await image.getAttribute('src')).match(/\/([a-z]+)\.svg$/)[1];
  const country = flagCountries.find(country => country.code === code);
  await expect(page.getByRole('timer')).toHaveText('00:10');
  await page.clock.runFor(9000);
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.clock.runFor(1000);
  await expect(page.getByRole('status')).toContainText(`Vaqt tugadi! To‘g‘ri javob: ${country.name}`);
  await expect(page.locator('[aria-label="Javob variantlari"] button:enabled')).toHaveCount(0);
  await expect(page.getByText('0 ball',{exact:true})).toBeVisible();
  await page.clock.runFor(2000);
  await expect(page.getByText('Savol 2/5',{exact:true})).toBeVisible();
  await expect(page.getByRole('timer')).toHaveText('00:10');
  await expect(page.getByRole('button',{name:/50\/50/})).toBeEnabled();
});

test('flag correct answer scores only once and 50/50 does not extend time', async ({page}) => {
  await page.goto('/geography/flags');
  await freezeTime(page, page.getByRole('button',{name:'O‘yinni boshlash'}));
  await page.getByRole('button',{name:'O‘yinni boshlash'}).click();
  const code = (await page.getByAltText('Qaysi davlatning bayrog‘i?').getAttribute('src')).match(/\/([a-z]+)\.svg$/)[1];
  const country = flagCountries.find(country => country.code === code);
  await page.clock.runFor(8000);
  await page.getByRole('button',{name:/50\/50/}).click();
  await expect(page.getByRole('timer')).toHaveText('00:02');
  const options = page.locator('[aria-label="Javob variantlari"]');
  await options.getByRole('button',{name:country.name,exact:true}).click();
  await expect(page.getByText('1 ball',{exact:true})).toBeVisible();
  await expect(options.locator('button:enabled')).toHaveCount(0);
  await page.clock.runFor(2000);
  await expect(page.getByText('Savol 2/10',{exact:true})).toBeVisible();
  await expect(page.getByText('1 ball',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:/50\/50/})).toBeDisabled();
});

test('map timeout reveals green answer and auto advances in full map', async ({page}) => {
  await page.goto('/geography/challenge');
  await freezeTime(page, page.getByRole('button',{name:/Osiyo.*Tanlash/}));
  await page.getByRole('button',{name:/Osiyo.*Tanlash/}).click();
  await page.getByRole('button',{name:/5 ta/}).click();
  await page.getByRole('button',{name:'Butun xarita',exact:true}).click();
  const overlay = page.getByRole('region',{name:'To‘liq xaritadagi o‘yin'});
  await expect(overlay.getByRole('timer')).toHaveText('00:10');
  await page.clock.runFor(10000);
  await expect(overlay.getByRole('status')).toContainText('Vaqt tugadi!');
  await expect(page.locator('path[fill="#34d399"]')).toHaveCount(1);
  await page.clock.runFor(2000);
  await expect(overlay.getByText(/Savol 2\/5/)).toBeVisible();
  await expect(overlay.getByRole('timer')).toHaveText('00:10');
});
