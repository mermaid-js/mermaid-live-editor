import { defaultState, MAX_URL_LENGTH } from '$/constants';
import { deserializeState, serializeState } from '$/util/serde';
import { randomBytes } from 'node:crypto';
import { expect, test } from './test';

const notification = 'The diagram is too large to be stored in the URL';

// Random text barely compresses, so each character adds about one character to the URL.
const randomText = (length: number) => randomBytes(length).toString('base64url').slice(0, length);

// A valid diagram: the default flowchart followed by a comment of `length` characters.
const comment = randomText(MAX_URL_LENGTH);
const commentedCode = (length: number) => `${defaultState.code}\n%% ${comment.slice(0, length)}`;

const editURL = (code: string) => `/edit#${serializeState({ ...defaultState, code })}`;
const codeInURL = (url: string) => {
  const hash = new URL(url).hash.slice(1);
  return hash ? deserializeState(hash).code : undefined;
};

test.describe('URL length limit', () => {
  test('notifies the user when typing makes the diagram too large for the URL', async ({
    editPage,
    page
  }) => {
    test.slow(); // Every keystroke re-serializes about 1 MiB of state

    // Loads the diagram with a comment of `length` characters and returns the URL length the app writes.
    const load = async (length: number) => {
      const code = commentedCode(length);
      const url = editURL(code);
      await editPage.start(url);
      // Wait for the app to write its own serialization of the loaded diagram to the URL.
      await expect
        .poll(() => !page.url().endsWith(url) && codeInURL(page.url()) === code)
        .toBe(true);
      return page.url().length;
    };

    // Grow the comment until the URL is just under the limit, in smaller steps near it
    // since compression makes large steps overshoot by a few dozen characters.
    let length = Math.floor(MAX_URL_LENGTH / 1.05);
    let urlLength = await load(length);
    while (MAX_URL_LENGTH - urlLength > 50) {
      const target = MAX_URL_LENGTH - (MAX_URL_LENGTH - urlLength > 400 ? 200 : 25);
      length += Math.floor(((target - urlLength) * length) / urlLength);
      urlLength = await load(length);
    }
    await editPage.checkTextInView('Christmas');
    await expect(page.getByText(notification)).toBeHidden();

    // Type a new comment line at the end of the diagram until the URL limit is hit.
    await editPage.editor.click();
    await page.keyboard.press('Control+End');
    await page.keyboard.press('Enter');
    let typed = '%% ';
    await page.keyboard.type(typed);
    while (codeInURL(page.url()) !== undefined) {
      const char = randomText(1);
      typed += char;
      await page.keyboard.type(char);
      // The URL update is debounced, so wait for it before typing on.
      await expect.poll(() => codeInURL(page.url())?.endsWith(typed) ?? true).toBe(true);
    }
    await expect(page.getByText(notification)).toBeVisible();
    await expect(page).toHaveURL(/\/edit$/);
    await editPage.checkTextInView('Christmas');

    // Deleting the typed line brings the diagram back under the limit.
    await page.keyboard.press('Shift+Home');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await expect(page).toHaveURL(/\/edit#pako:/);
  });
});
