import { type Page, expect } from '@playwright/test';
import { readFileSync, statSync } from 'node:fs';

export const cmd = process.platform === 'darwin' ? 'Meta' : 'Control';

export interface EditorOptions {
  bottom?: boolean;
  newline?: boolean;
}

declare global {
  interface Window {
    editorLoaded: boolean;
  }
}

export async function typeInEditor(
  page: Page,
  text: string,
  { bottom = true, newline = false }: EditorOptions = {}
) {
  const editor = page.locator('css=.monaco-editor');
  await editor.click();

  if (bottom) {
    await editor.locator('textarea').press('PageDown');
  }
  if (newline) {
    await editor.locator('textarea').press('Enter');
  }
  await page.keyboard.type(text, { delay: 10 });
}

export async function verifyFileSizeGreaterThan(
  page: Page,
  fileType: 'history' | 'diagram',
  extension: string,
  size: number
): Promise<number> {
  const download = await page.waitForEvent('download');
  const path = await download.path();
  if (!path) throw new Error('Download path not available');
  const fileSize = statSync(path).size;
  expect(fileSize).toBeGreaterThan(size);
  expect(fileSize).toBeLessThan(size * 2);
  return fileSize;
}

export async function verifyFileSnapshot(
  page: Page,
  fileType: 'history' | 'diagram',
  extension: string,
  content: string
) {
  const download = await page.waitForEvent('download');
  const path = await download.path();
  if (!path) throw new Error('Download path not available');
  const fileContent = readFileSync(path, 'utf8');
  expect(fileContent).toContain(content);
}
