import { expect, test } from '@playwright/test';
import { typeInEditor, verifyFileSizeGreaterThan } from './utils';

test.describe('Check actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/edit');
    await page.getByText('Actions', { exact: true }).click();
  });

  test('should update markdown code', async ({ page }) => {
    const markdown = page.locator('#markdown');
    const oldText = await markdown.inputValue();
    await typeInEditor(page, 'C --> HistoryTest', { bottom: true, newline: true });
    const newText = await markdown.inputValue();
    expect(newText).not.toBe(oldText);
  });

  test.skip('should load gists from URL', async ({ page }) => {
    await page
      .locator('#gist')
      .fill('https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a');
    await page.getByText('Load Gist').click();
    await expect(page.getByText('Go shopping!!')).toBeVisible();
  });

  test('should download png and svg', async ({ page }) => {
    const downloadPNGPromise = verifyFileSizeGreaterThan(page, 'diagram', 'png', 29_000);
    await page.locator('#downloadPNG').click();
    await downloadPNGPromise;

    const downloadSVGPromise = verifyFileSizeGreaterThan(page, 'diagram', 'svg', 10_000);
    await page.locator('#downloadSVG').click();
    await downloadSVGPromise;

    // Verify downloaded file is different for different diagrams
    await page.getByText('Sample Diagrams').click();
    await page.getByText('ER', { exact: true }).click();

    const downloadPNGPromise2 = verifyFileSizeGreaterThan(page, 'diagram', 'png', 35_000);
    await page.locator('#downloadPNG').click();
    await downloadPNGPromise2;

    const downloadSVGPromise2 = verifyFileSizeGreaterThan(page, 'diagram', 'svg', 11_000);
    await page.locator('#downloadSVG').click();
    await downloadSVGPromise2;
  });
});
