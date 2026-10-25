import { test, expect } from '@playwright/test';

test('blocked storage does not prevent loading or changing the theme', async ({ page }) => {
  test.setTimeout(120000);
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Kunduzgi rejim', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('combobox', { name: 'Tilni tanlash' }).selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('button', { name: 'Dark mode', exact: true })).toBeVisible();
});

test('light theme applies across all geography tool pages', async ({ page }) => {
  test.setTimeout(180000);
  await page.addInitScript(() => localStorage.setItem('explorex-theme', 'light'));
  for (const route of ['/geography/map', '/geography/challenge', '/geography/flags', '/geography/records', '/geography/time-atlas']) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('main')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  }
});
