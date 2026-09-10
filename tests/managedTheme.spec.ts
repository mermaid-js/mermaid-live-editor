import type { Page } from '@playwright/test';
import { expect, test } from './test';

const storedTheme = (page: Page) =>
  page.evaluate(() => {
    const { mermaid } = JSON.parse(localStorage.getItem('codeStore') ?? '{}') as {
      mermaid?: string;
    };
    return (JSON.parse(mermaid ?? '{}') as { theme?: string }).theme;
  });

test.describe('Managed theme', () => {
  test.beforeEach(async ({ editPage }) => {
    await editPage.toggleSampleDiagrams();
  });

  test('follows the diagram type', async ({ editPage, page }) => {
    await editPage.loadSampleDiagram('Pie');
    await expect.poll(() => storedTheme(page)).toBe('default');
    await editPage.loadSampleDiagram('Flowchart');
    await expect.poll(() => storedTheme(page)).toBe('redux-color');
  });

  test('switches to the dark variant with the site theme', async ({ editPage, page }) => {
    await editPage.loadSampleDiagram('Flowchart');
    await expect.poll(() => storedTheme(page)).toBe('redux-color');
    await editPage.toggleTheme();
    await expect.poll(() => storedTheme(page)).toBe('redux-dark-color');
    await editPage.toggleTheme();
    await expect.poll(() => storedTheme(page)).toBe('redux-color');
  });
});
