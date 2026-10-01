import { C, TID } from '$/constants';
import { test as base, expect, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { verifyFileSizeGreaterThan, type EditorOptions } from './utils';

export class EditorPage {
  readonly editor: Locator;
  readonly markdownInput: Locator;
  readonly view: Locator;

  constructor(readonly page: Page) {
    this.editor = page.locator('css=.monaco-editor');
    this.markdownInput = page.getByTestId(TID.copyMarkdown);
    this.view = page.locator('#view');
  }

  async start(url = '/edit') {
    await this.page.goto(url);
    await expect(this.page)
      .toHaveURL(/.*\/edit#pako/)
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  async typeInEditor(text: string, { bottom = true, newline = false }: EditorOptions = {}) {
    await this.editor.click();
    if (bottom) {
      await this.page.keyboard.press('PageDown');
    }
    if (newline) {
      await this.page.keyboard.press('Enter');
    }
    // Line breaks are inserted as text rather than pressed as Enter: Monaco's
    // word-based quick suggestions resolve asynchronously, and an Enter that
    // lands while the list is open accepts the suggestion instead of breaking
    // the line, which at synthetic typing speed happens often enough to flake.
    const lines = text.split('\n');
    for (const [index, line] of lines.entries()) {
      if (index > 0) {
        await this.page.keyboard.insertText('\n');
      }
      await this.page.keyboard.type(line, { delay: 10 });
    }
  }

  async clearEditor() {
    await this.editor.click();
    await this.page.keyboard.press('Control+KeyA');
    await this.page.keyboard.press('Backspace');
  }

  async toggleActions() {
    await this.page.getByText('Actions', { exact: true }).click();
  }

  async toggleSampleDiagrams() {
    await this.page.getByText('Sample Diagrams', { exact: true }).click();
  }

  async checkAndDownloadPNG(expectedSize: number) {
    const downloadPNGPromise = verifyFileSizeGreaterThan(this.page, 'diagram', 'png', expectedSize);
    await this.page.getByTestId(TID.downloadPNG).click();
    return await downloadPNGPromise;
  }

  async downloadSVG(expectedSize: number) {
    const downloadSVGPromise = verifyFileSizeGreaterThan(this.page, 'diagram', 'svg', expectedSize);
    await this.page.getByTestId(TID.downloadSVG).click();
    return await downloadSVGPromise;
  }

  /** Downloads the diagram code as a .mmd file and returns its name and contents. */
  async downloadMMD() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByTestId(TID.downloadMMD).click();
    const download = await downloadPromise;
    const path = await download.path();
    return { content: readFileSync(path, 'utf8'), name: download.suggestedFilename() };
  }

  /** Clicks `trigger`, which must open the diagram file picker, and chooses a file in it. */
  async openFile(trigger: Locator, name: string, content: string) {
    const chooserPromise = this.page.waitForEvent('filechooser');
    await trigger.click();
    const chooser = await chooserPromise;
    await chooser.setFiles({ buffer: Buffer.from(content, 'utf8'), mimeType: 'text/plain', name });
  }

  async openMainMenu() {
    await this.page.getByTestId(TID.mainMenuButton).click();
  }

  async loadSampleDiagram(diagramName: string) {
    await this.page.getByText(diagramName, { exact: true }).click();
  }

  async checkTextInView(text: string) {
    await expect(this.view).toContainText(text);
  }

  async checkTextNotInView(text: string) {
    await expect(this.view).not.toContainText(text);
  }

  async checkError(text: string) {
    await expect(this.page.getByTestId(TID.errorContainer)).toContainText(text, {
      timeout: 10_000
    });
  }

  async checkInEditor(text: string) {
    await expect(this.editor).toContainText(text);
  }

  async toggleComment(text: string) {
    await this.editor.getByText(text).click();
    await this.page.keyboard.press('Control+/');
  }

  async setEditorMode(mode: 'Code' | 'Config') {
    await this.page.getByRole('tab').getByText(mode).click();
  }

  async checkDocURL(url: string | RegExp) {
    await expect(this.page.getByTestId(TID.diagramDocumentationButton)).toHaveAttribute(
      'href',
      url
    );
  }

  async toggleTheme() {
    await this.page.getByTestId(TID.themeToggleButton).click();
  }

  async checkTheme(theme: 'light' | 'dark') {
    await expect(this.page.getByTestId(TID.themeToggleButton)).toHaveAttribute(
      'title',
      `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`
    );
  }

  async checkAIHelperVisibility(shouldBeVisible: boolean) {
    const button = this.page.getByTestId(TID.aiRepairButton);
    const helpText = this.page.getByTestId(TID.aiHelpText);
    await expect(button)[shouldBeVisible ? 'toBeVisible' : 'toBeHidden']();
    await expect(helpText)[shouldBeVisible ? 'toBeVisible' : 'toBeHidden']();
  }
}

export const test = base.extend<{ editPage: EditorPage }>({
  editPage: async ({ page }, use) => {
    // Dismiss the editor chooser modal so it doesn't block interactions
    await page.addInitScript((key) => {
      window.localStorage.setItem(key, 'true');
    }, C.editorChooserDismissedKey);
    const editorPage = new EditorPage(page);
    await editorPage.start();
    await editorPage.toggleSampleDiagrams();
    await use(editorPage);
  }
});

export { expect } from '@playwright/test';
