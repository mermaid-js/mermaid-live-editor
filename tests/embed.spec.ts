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
    const body = await response.text();
    expect(body).toContain('mermaid-embed');
    expect(body).toContain(
      'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'
    );
  });

  base('should render inside the sandboxed iframe the snippets use', async ({ page }) => {
    failOnDialog(page);
    const embedSrc = `/embed?code=${encodeURIComponent('graph TD\n  A[Sandboxed]-->B')}`;
    await page.setContent(
      `<!doctype html><iframe id="embed" title="embed"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        src="http://localhost:3000${embedSrc}"
        style="width:800px;height:500px;border:0"></iframe>`
    );
    const frame = page.frameLocator('#embed');
    await expect(frame.locator('#embed-container svg')).toBeVisible({ timeout: 20_000 });
    await expect(frame.locator('#embed-view')).toContainText('Sandboxed');
    // Code-level isolation: the embed document must not write the editor store.
    const codeStore = await frame.locator('html').evaluate(() => localStorage.getItem('codeStore'));
    expect(codeStore).toBeNull();
  });

  base('should load #code: hashes from the web component path', async ({ page }) => {
    failOnDialog(page);
    await page.goto(
      `/embed?theme=forest#code:${encodeURIComponent('graph TD\n  A[HashCode]-->B')}`
    );
    await expect(page.locator('#embed-view')).toContainText('HashCode');
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
    await expect(snippet).toHaveValue(/sandbox="allow-scripts allow-same-origin/);
    await page.getByRole('radio', { name: 'Web component' }).click();
    await expect(snippet).toHaveValue(/<mermaid-embed/);
  });
});
