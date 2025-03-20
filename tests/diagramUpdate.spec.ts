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

  test('should update diagram when shortcut is used', async ({ page }) => {
    await page.getByText('Auto sync').click();
    await expect(page.locator('#view')).not.toHaveClass(/outOfSync/);
    await typeInEditor(page, '  C --> Test');
    await expect(page.locator('#view')).toHaveClass(/outOfSync/);
    await expect(page.locator('#errorContainer')).toContainText('Diagram out of sync.');
    await page.locator('#editor').click();
    await page.keyboard.press('Control+Enter');
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

  test('should automatically defer rendering when complex diagrams are edited', async ({
    page
  }) => {
    await expect(page.locator('#view')).not.toHaveClass(/outOfSync/);
    await typeInEditor(
      page,
      `
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K`
    );
    await expect(page.locator('#view')).toHaveClass(/outOfSync/);
    await expect(page.locator('#errorContainer')).toContainText(
      'It will be updated automatically.'
    );
    // The class should be removed automatically after 1 second
    await expect(page.locator('#view')).not.toHaveClass(/outOfSync/, { timeout: 2000 });
  });

  test('supports commenting code out/in', async ({ page }) => {
    await page.locator('#editor').getByText('fa-car').click();
    await page.waitForTimeout(1000);
    await page.keyboard.press('Control+/');

    await expect(page.locator('#view').getByText('Car')).not.toBeVisible();

    await page.keyboard.press('Control+/');
    await expect(page.locator('#view').getByText('Car')).toBeVisible();
  });

  test('supports editing code when code is incorrect', async ({ page }) => {
    await page.goto(
      '/edit#pako:eNpljjEKwzAMRa8SNOcEnlt6gK5eVFvYJsgOqkwpIXevg9smEE1PnyfxF3DFExgISW-CczQ2D21cYU7a-SGYXRwyvTp9jUhuKlVP-eHy7zA-leQsMEmg_QOM0BLG5FujZVMsaCQmC6ahR5ks2Lw2r84ela4-aREwKpVGwKrl_s7ut3fnkjAIcg_XDzuaUhs'
    );
    await expect(page.getByText('Diagram syntax error')).not.toBeVisible();
    await typeInEditor(page, 'branch test', { bottom: true, newline: true });
    await expect(page.locator('#editor')).toContainText('branch test');
    await expect(
      page.getByText('Error: Trying to checkout branch which is not yet created.')
    ).toBeVisible();
  });

  test('should update diagram after entire text is removed', async ({ page }) => {
    await page.locator('#editor').click();
    await page.keyboard.press('Control+KeyA');
    await page.keyboard.press('Backspace');
    await typeInEditor(
      page,
      `graph LR
	A-->Bike`
    );
    await expect(page.locator('#view').getByText('Bike')).toBeVisible();
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
