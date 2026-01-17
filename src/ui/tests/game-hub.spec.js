import { test, expect } from '@playwright/test';

test('create a new game from the hub', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Game Hub' })).toBeVisible();

  await page.getByRole('button', { name: '+ New Game' }).click();

  await page.getByLabel('Game Name').fill('Family Game Night');
  await page.getByLabel('Nickname').fill('Alex');
  await page.getByLabel('Email').fill('alex@example.com');
  await page.getByRole('button', { name: 'Add Player' }).click();

  await page.getByRole('button', { name: 'Start Game (1)' }).click();

  await expect(page.getByRole('heading', { name: 'Family Game Night' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
});
