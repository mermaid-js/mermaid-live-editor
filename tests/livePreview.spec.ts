import { expect, test } from './test';

test('keeps a new-tab preview synchronized with the editor', async ({ editPage }) => {
  await editPage.clearEditor();
  await editPage.typeInEditor('flowchart LR; A[Initial preview] --> B[Target]');
  await editPage.checkTextInView('Initial preview');

  const popupPromise = editPage.page.waitForEvent('popup');
  await editPage.page.getByTitle('Open Live Preview').click();
  const preview = await popupPromise;

  await expect(preview).toHaveURL(/\/view\?live=[\w-]+#pako:/);
  await expect(preview.locator('#view')).toContainText('Initial preview');

  await editPage.typeInEditor('; B --> C[Updated live]');
  await expect(preview.locator('#view')).toContainText('Updated live');
});
