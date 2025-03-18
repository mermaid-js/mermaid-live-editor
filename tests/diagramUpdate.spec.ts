import { expect, test } from '@playwright/test';
import { typeInEditor } from './utils';

test.describe('Auto sync tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/edit#pako/);
  });

  test('should dim diagram when code is edited', async ({ page }) => {
    await page.getByText('Auto sync').click();
    await expect(page.locator('#view')).not.toHaveClass(/outOfSync/);
    await expect(page.locator('#errorContainer')).not.toBeVisible();
    await typeInEditor(page, '  C --> Test', { bottom: true });
    await expect(page.locator('#view')).toHaveClass(/outOfSync/);
    await expect(page.locator('#errorContainer')).toContainText('Diagram out of sync.');
    const codeStore = await page.evaluate(() => localStorage.getItem('codeStore'));
    expect(codeStore).toBeTruthy();
  });

  test.skip('should update diagram when shortcut is used', async ({ page }) => {
    await page.getByText('Auto sync').click();
    await expect(page.locator('#view')).not.toHaveClass(/outOfSync/);
    await typeInEditor(page, '  C --> Test');
    await expect(page.locator('#view')).toHaveClass(/outOfSync/);
    await expect(page.locator('#errorContainer')).toContainText('Diagram out of sync.');
    await page.locator('#editor').click();
    await page.keyboard.press('ControlOrMeta+Enter');
    await page.keyboard.press('ControlOrMeta+Enter');
    await expect(page.locator('#errorContainer')).not.toBeVisible();
    await expect(page.locator('#view')).not.toHaveClass(/outOfSync/);
  });

  test('should show/hide sync button with auto sync', async ({ page }) => {
    await expect(page.locator('[data-cy=sync]')).not.toBeVisible();
    await page.getByText('Auto sync').click();
    await expect(page.locator('[data-cy=sync]')).toBeVisible();
    await page.locator('#autoSync').check();
    await expect(page.locator('[data-cy=sync]')).not.toBeVisible();
  });

  test('should not dim diagram when code is in sync', async ({ page }) => {
    await page.getByText('Auto sync').click();
    await expect(page.locator('#view')).not.toHaveClass(/outOfSync/);
    await typeInEditor(page, '  C --> Test');
    await expect(page.locator('#view')).toHaveClass(/outOfSync/);
    await page.locator('[data-cy=sync]').click();
    await expect(page.locator('#view')).not.toHaveClass(/outOfSync/);
    await page.locator('#autoSync').check();
    await typeInEditor(page, 'ing');
    await expect(page.locator('#view')).not.toHaveClass(/outOfSync/);
    const codeStore = await page.evaluate(() => localStorage.getItem('codeStore'));
    expect(codeStore).toBeTruthy();
  });
});

test.describe('Pan and Zoom', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle pan and zoom', async ({ page }) => {
    await expect(page.locator('#svg-pan-zoom-reset-pan-zoom')).not.toBeVisible();
    await page.getByText('Pan & Zoom').click();
    await expect(page.locator('#svg-pan-zoom-reset-pan-zoom')).toBeVisible();
    await page.getByText('Pan & Zoom').click();
    await expect(page.locator('#svg-pan-zoom-reset-pan-zoom')).not.toBeVisible();
  });
});
