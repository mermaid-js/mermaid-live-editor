import { expect, test } from './test';

test.describe('Check actions', () => {
  test.beforeEach(async ({ editPage }) => {
    await editPage.toggleActions();
  });

  test('should update markdown code', async ({ editPage }) => {
    const oldText = await editPage.markdownInput.inputValue();
    await editPage.typeInEditor('C --> HistoryTest', { bottom: true, newline: true });
    const newText = await editPage.markdownInput.inputValue();
    expect(newText).not.toBe(oldText);
  });

  test.skip('should load gists from URL', async ({ page }) => {
    await page
      .locator('#gist')
      .fill('https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a');
    await page.getByText('Load Gist').click();
    await expect(page.getByText('Go shopping!!')).toBeVisible();
  });

  test('should download png and svg', async ({ editPage }) => {
    const firstPngSize = await editPage.checkAndDownloadPNG(80_000);
    const firstSvgSize = await editPage.downloadSVG(30_000);

    // Verify downloaded file is different for different diagrams
    await editPage.toggleSampleDiagrams();
    await editPage.loadSampleDiagram('Entity Relationship');

    const secondPngSize = await editPage.checkAndDownloadPNG(81_000);
    const secondSvgSize = await editPage.downloadSVG(40_000);

    // Verify files are actually different
    expect(firstPngSize).not.toBe(secondPngSize);
    expect(firstSvgSize).not.toBe(secondSvgSize);
  });
});
