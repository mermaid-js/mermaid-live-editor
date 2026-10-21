import { TID } from '$/constants';
import { expect, test } from './test';

test.describe('Check actions', () => {
  test.beforeEach(async ({ editPage }) => {
    await editPage.toggleActions();
  });

  test('should update markdown code', async ({ editPage }) => {
    const oldText = await editPage.markdownInput.inputValue();
    await editPage.typeInEditor('C --> HistoryTest', { bottom: true, newline: true });
    await expect(editPage.markdownInput).not.toHaveValue(oldText);
  });

  test.skip('should load gists from URL', async ({ page }) => {
    await page
      .locator('#gist')
      .fill('https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a');
    await page.getByText('Load Gist').click();
    await expect(page.getByText('Go shopping!!')).toBeVisible();
  });

  test('should download the diagram code as an mmd file', async ({ editPage }) => {
    const { content, name } = await editPage.downloadMMD();
    expect(name).toMatch(/^mermaid-diagram-.*\.mmd$/);
    expect(content).toContain('flowchart TD');
    expect(content).toContain('A[Christmas] -->|Get money| B(Go shopping)');
  });

  test('should open a local mmd file into the editor', async ({ editPage, page }) => {
    await editPage.openFile(
      page.getByTestId(TID.openFileButton),
      'opened.mmd',
      'graph LR\n  Opened --> FromFile'
    );
    await editPage.checkInEditor('FromFile');
    await editPage.checkTextInView('FromFile');
  });

  test('should download png and svg', async ({ editPage }) => {
    const firstPngSize = await editPage.checkAndDownloadPNG(20_000);
    const firstSvgSize = await editPage.downloadSVG(10_000);

    // Verify downloaded file is different for different diagrams
    await editPage.toggleSampleDiagrams();
    await editPage.loadSampleDiagram('Entity Relationship');

    const secondPngSize = await editPage.checkAndDownloadPNG(20_000);
    const secondSvgSize = await editPage.downloadSVG(10_000);

    // Verify files are actually different
    expect(firstPngSize).not.toBe(secondPngSize);
    expect(firstSvgSize).not.toBe(secondSvgSize);
  });
});
