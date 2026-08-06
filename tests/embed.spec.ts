import { defaultState, TID } from '$/constants';
import type { State } from '$/types';
import { serializeState } from '$/util/serde';
import { expect, test as base, type Page } from '@playwright/test';
import { test as editorTest } from './test';

const embedHash = (state: Partial<State>): string => serializeState({ ...defaultState, ...state });

const failOnDialog = (page: Page): void => {
  page.on('dialog', (dialog) => {
    throw new Error(`Unexpected dialog on /embed: ${dialog.message()}`);
  });
};

base.describe('Embed page', () => {
  base('should render a diagram from the URL hash with footer links', async ({ page }) => {
    failOnDialog(page);
    await page.goto(`/embed#${embedHash({ code: 'graph TD\n  A[Hello embed] --> B[World]' })}`);
    await expect(page.locator('#embed-container svg')).toBeVisible();
    await expect(page.locator('#embed-view')).toContainText('Hello embed');
    await expect(page.getByTestId(TID.embedFooter)).toBeVisible();
    await expect(page.getByTestId(TID.embedEditLink)).toHaveAttribute('href', /\/edit#pako:/);
  });

  base('should let ?code= override the hash code', async ({ page }) => {
    failOnDialog(page);
    const params = new URLSearchParams({ code: 'graph TD\n  Q[Query wins]' });
    await page.goto(`/embed?${params.toString()}#${embedHash({ code: 'graph TD\n  H[Hash]' })}`);
    await expect(page.locator('#embed-view')).toContainText('Query wins');
    await expect(page.locator('#embed-view')).not.toContainText('Hash');
  });

  base('should hide the toolbar and mode toggle with ?controls=0', async ({ page }) => {
    failOnDialog(page);
    await page.goto('/embed?controls=0');
    await expect(page.locator('#embed-container svg')).toBeVisible();
    await expect(page.getByTestId(TID.embedToolbar)).toHaveCount(0);
    await expect(page.getByTestId(TID.embedModeToggle)).toHaveCount(0);
  });

  base('should apply and toggle dark mode', async ({ page }) => {
    failOnDialog(page);
    await page.goto('/embed?mode=dark');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByTestId(TID.embedModeToggle).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  base('should show an error card for a malformed hash', async ({ page }) => {
    failOnDialog(page);
    await page.goto('/embed#pako:garbage');
    await expect(page.getByTestId(TID.embedErrorCard)).toBeVisible();
    await expect(page.locator('#embed-container svg')).toHaveCount(0);
  });

  base('should silently strip unsafe config and stay isolated', async ({ page }) => {
    failOnDialog(page);
    await page.goto(
      `/embed#${embedHash({
        code: 'graph TD\n  S[Sanitized]',
        mermaid: JSON.stringify({
          securityLevel: 'loose',
          themeVariables: { nodeBorder: '<script>alert(1)</script>' }
        })
      })}`
    );
    await expect(page.locator('#embed-view')).toContainText('Sanitized');
    const codeStore = await page.evaluate(() => localStorage.getItem('codeStore'));
    expect(codeStore).toBeNull();
  });

  base('should serve the web component loader at /embed.js', async ({ page }) => {
    const response = await page.request.get('/embed.js');
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('mermaid-embed');
  });
});

editorTest.describe('Share dialog embed section', () => {
  editorTest('should offer iframe and web component snippets', async ({ editPage, page }) => {
    void editPage;
    await page.getByRole('button', { name: 'Share' }).click();
    const snippet = page.getByTestId(TID.embedSnippet);
    await expect(snippet).toBeVisible();
    await expect(snippet).toHaveValue(/\/embed\?.*#pako:/);
    await expect(snippet).toHaveValue(/<iframe/);
    await page.getByRole('radio', { name: 'Web component' }).click();
    await expect(snippet).toHaveValue(/<mermaid-embed/);
  });
});
