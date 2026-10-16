import { TID } from '$/constants';
import { test } from './test';

test.describe('Main menu', () => {
  test('should open a local mmd file into the editor', async ({ editPage, page }) => {
    await editPage.openMainMenu();
    await editPage.openFile(
      page.getByTestId(TID.menuOpenFile),
      'menu.mmd',
      'graph LR\n  Menu --> OpenedViaMenu'
    );
    await editPage.checkInEditor('OpenedViaMenu');
    await editPage.checkTextInView('OpenedViaMenu');
  });
});
