import { C } from '$/constants';
import { expect, test, type Page } from '@playwright/test';

// What a pre-mermaid-12 install left in localStorage: the editor seeded every
// config with the default theme.
const legacyCodeStore = JSON.stringify({
  code: 'graph TD\n  A[Legacy] --> B[Config]',
  grid: true,
  mermaid: '{\n  "theme": "default"\n}',
  panZoom: true,
  rough: false,
  updateDiagram: true
});

// Seeds the legacy install with the history-id migration already applied (v0).
// Guarded so reloads do not re-seed.
const seedLegacyInstall = (page: Page) =>
  page.addInitScript(
    ([codeStore, chooserKey]) => {
      if (localStorage.getItem('migrations') === null) {
        localStorage.setItem('migrations', JSON.stringify({ version: 0 }));
        localStorage.setItem('codeStore', codeStore);
        localStorage.setItem(chooserKey, 'true');
      }
    },
    [legacyCodeStore, C.editorChooserDismissedKey]
  );

const openEditor = async (page: Page) => {
  await page.goto('/edit');
  // Mounting can take a while on a cold dev server; the sidebar marks it done.
  await page.getByText('Sample Diagrams', { exact: true }).waitFor();
};

const storedConfig = (page: Page) =>
  page.evaluate(
    () => (JSON.parse(localStorage.getItem('codeStore') ?? '{}') as { mermaid?: string }).mermaid
  );

const migrationVersion = (page: Page) =>
  page.evaluate(
    () => (JSON.parse(localStorage.getItem('migrations') ?? '{}') as { version?: number }).version
  );

test.describe('Default theme config migration', () => {
  test('replaces a legacy default-theme config with the diagram default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await seedLegacyInstall(page);
    await openEditor(page);
    await expect(page.locator('#view')).toContainText('Legacy');
    await expect.poll(() => migrationVersion(page)).toBe(1);
    // A flowchart: mermaid 12's own default for it is redux-color.
    await expect.poll(() => storedConfig(page)).toBe('{\n  "theme": "redux-color"\n}');
  });

  test('uses the redux dark variant when the site is dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await seedLegacyInstall(page);
    await openEditor(page);
    await expect(page.locator('#view')).toContainText('Legacy');
    await expect.poll(() => migrationVersion(page)).toBe(1);
    await expect
      .poll(async () => JSON.parse((await storedConfig(page)) ?? '{}') as unknown)
      .toEqual({ theme: 'redux-dark-color' });
  });
});
