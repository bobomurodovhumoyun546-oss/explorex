import { test, expect } from '@playwright/test';
import process from 'node:process';

test.setTimeout(90000);

async function expectNoHorizontalOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

test('geography cards display all five bundled pictures', async ({ page }, testInfo) => {
  test.skip(!process.env.RUN_WEBGL_TESTS, 'Opt-in: this environment times out while rendering WebGL; run on a GPU-capable browser.');
  await page.goto('/geography');
  for (const alt of ['Tarixiy dunyo xaritasi', 'Dunyo xaritasi', 'Davlatni top', 'Dunyo bayroqlari', 'Yer rekordlari']) {
    const image = page.getByAltText(alt, { exact: true });
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
    const bounds = await image.boundingBox();
    expect(bounds.width).toBeGreaterThan(200);
    expect(bounds.height).toBeGreaterThan(100);
  }
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('geography-cards.png') });
});

test('Sun opens in full universe mode and Escape closes its panel before leaving the map', async ({ page }, testInfo) => {
  test.skip(!process.env.RUN_WEBGL_TESTS, 'Opt-in: this environment times out while rendering WebGL; run on a GPU-capable browser.');
  test.setTimeout(90000);
  await page.goto('/astronomy');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await page.getByRole('button', { name: 'Faqat xaritani ko‘rsatish', exact: true }).click();
  const panel = page.getByRole('region', { name: "Quyosh haqida ma'lumot", exact: true });
  await expect(async () => {
    const bounds = await canvas.boundingBox();
    await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await expect(panel).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 30000 });
  await expect(panel.getByRole('heading', { name: 'Quyosh', exact: true })).toBeVisible();
  await expect(panel.getByText('Diametri', { exact: true })).toBeVisible();
  if (testInfo.project.name === 'mobile') {
    const bounds = await panel.boundingBox();
    expect(bounds.y).toBeGreaterThan(page.viewportSize().height * .45);
  }
  await page.screenshot({ path: testInfo.outputPath('sun-panel.png') });
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(page.locator('[data-map-only="true"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-map-only="false"]')).toBeVisible();
  await page.getByRole('button', { name: 'Yer', exact: true }).click();
  await expect(page.getByRole('region', { name: "Yer haqida ma'lumot", exact: true })).toBeVisible();
});

test('telescope photos load and the viewer supports zoom and Escape', async ({ page }) => {
  await page.goto('/astronomy/telescope');
  await page.getByRole('button', { name: 'James Webb', exact: true }).click();
  const image = page.locator('article img').first();
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
  await page.locator('article button').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Suratni kattalashtirish', exact: true }).click();
  await expect(dialog.getByText('150%', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expectNoHorizontalOverflow(page);
});

test('Earth records search shows matching records and an empty state', async ({ page }) => {
  await page.goto('/geography/records');
  const search = page.getByRole('textbox', { name: 'Rekord qidirish' });
  await search.fill('Baykal');
  await expect(page.getByRole('heading', { name: 'Baykal', exact: true, level: 2 })).toBeVisible();
  await search.fill('zzzz-no-record');
  await expect(page.getByText(/topilmadi/)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('unknown links show a useful recovery page', async ({ page }) => {
  await page.goto('/unknown-page');
  await expect(page.getByRole('heading', { name: 'Sahifa topilmadi' })).toBeVisible();
  await page.getByRole('link', { name: 'Bosh sahifaga qaytish', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('navigation fits a narrow phone and menu links work', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await expectNoHorizontalOverflow(page);
  const menu = page.locator('header button[aria-expanded]');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.locator('header').getByRole('link', { name: 'Bosh sahifa', exact: true }).last().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expectNoHorizontalOverflow(page);
});
