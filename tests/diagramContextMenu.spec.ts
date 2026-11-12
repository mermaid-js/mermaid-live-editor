import { TID } from '#lib/constants.ts';
import { expect, test } from './test';
import { verifyFileSizeGreaterThan } from './utils';

test.describe('Diagram context menu', () => {
  test.beforeEach(async ({ editPage }) => {
    await expect(editPage.view.locator('svg').first()).toBeVisible();
    await editPage.page.getByTestId(TID.diagramContextMenuTrigger).click({ button: 'right' });
  });

  test('copies share link and code', async ({ page }) => {
    await page.getByTestId(TID.contextMenuCopyLink).click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toMatch(/\/edit#pako:/);

    await page.getByTestId(TID.diagramContextMenuTrigger).click({ button: 'right' });
    await page.getByTestId(TID.contextMenuCopyCode).click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain('flowchart');
  });

  test('copies diagram image', async ({ page }) => {
    await page.getByTestId(TID.contextMenuCopyImage).click();
    await expect
      .poll(
        () => page.evaluate(async () => (await navigator.clipboard.read()).flatMap((i) => i.types)),
        { timeout: 10_000 }
      )
      .toContain('image/png');
  });

  test('downloads svg', async ({ page }) => {
    const download = verifyFileSizeGreaterThan(page, 'diagram', 'svg', 10_000);
    await page.getByTestId(TID.contextMenuDownloadSVG).click();
    await download;
  });

  test('tracks analytics events', async ({ page }) => {
    const events: string[] = [];
    page.on('console', (message) => {
      if (message.text().startsWith('[plausible] contextMenu')) events.push(message.text());
    });
    await page.keyboard.press('Escape');
    await page.getByTestId(TID.diagramContextMenuTrigger).click({ button: 'right' });
    await page.getByTestId(TID.contextMenuCopyCode).click();
    await expect.poll(() => events.join('\n')).toContain('open');
    await expect.poll(() => events.join('\n')).toContain('copyCode');
  });
});
