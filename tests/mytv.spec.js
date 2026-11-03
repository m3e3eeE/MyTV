const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#startup')).toHaveClass(/gone/);
});

test('renders five normal channels and an explicit play control', async ({ page }) => {
  await expect(page.locator('.channel-dot')).toHaveCount(5);
  await expect(page.locator('#screen-play')).toBeVisible();
  await expect(page.locator('#playback-message')).toContainText(/Loading|Ready/);
});

test('primary H.264/AAC source reaches the ready-to-play state', async ({ page }) => {
  await expect(page.locator('#playback-status')).toHaveClass(/ready/, { timeout: 15000 });
  await expect(page.locator('#screen-play')).toContainText('Play channel');
});

test('Play button starts the ready channel after a user gesture', async ({ page }) => {
  await expect(page.locator('#playback-status')).toHaveClass(/ready/, { timeout: 15000 });
  await page.locator('#screen-play').click();
  await expect.poll(() => page.locator('#player').evaluate((video) => !video.paused)).toBe(true);
});

test('keyboard changes channels and opens/closes the guide', async ({ page }) => {
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#channel-number')).toHaveText('02');
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#guide')).toBeVisible();
  await expect(page.locator('#guide-close')).toBeFocused();
  await page.locator('#guide-close').click();
  await expect(page.locator('#guide')).toBeHidden();
});

test('mode controls work and kids mode has multiple switchable channels', async ({ page }) => {
  await page.keyboard.press('ArrowDown');
  await page.locator('[data-mode="kids"]').click();
  await expect(page.locator('#mode-label')).toHaveText('KIDS');
  await expect(page.locator('.channel-dot')).toHaveCount(3);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#channel-number')).toHaveText('02');
  await page.keyboard.press('ArrowDown');
  await page.locator('[data-mode="simple"]').click();
  await expect(page.locator('#mode-label')).toHaveText('SIMPLE');
  await expect(page.locator('#channel-dial')).toBeHidden();
});

test('Back key closes an open panel without navigating away', async ({ page }) => {
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#guide')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#guide')).toBeHidden();
  await expect(page).toHaveURL(/127\.0\.0\.1:4173/);
});

test('media error exposes retry rather than a silent black screen', async ({ browser }) => {
  const page = await browser.newPage();
  await page.route('**/*.mp4', (route) => route.abort());
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#playback-status')).toHaveClass(/error/);
  await expect(page.locator('#retry-playback')).toBeVisible();
  await page.close();
});

test('manager creates a channel, saves a direct URL and keeps it after reload', async ({ page }) => {
  await page.goto('/manage/');
  await page.locator('#new-channel').click();
  await page.locator('input[name="name"]').fill('My Clips');
  await page.locator('input[name="simple"]').check();
  await page.locator('#channel-form button[type="submit"]').click();
  await page.locator('input[name="url"]').fill('https://media.w3.org/2010/05/video/movie_300.mp4');
  await page.locator('input[name="title"]').fill('My legal clip');
  await page.locator('input[name="duration"]').fill('120');
  await page.locator('#video-form button[type="submit"]').click();
  await expect(page.locator('#video-list')).toContainText('My legal clip');
  await page.reload();
  await expect(page.locator('#channel-list')).toContainText('My Clips');
  await page.getByRole('button', { name: /My Clips/ }).click();
  await expect(page.locator('#video-list')).toContainText('My legal clip');
});
