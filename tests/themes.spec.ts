import { test } from './test';

test.describe('Test themes', () => {
  test.describe('Test color scheme preference', () => {
    test('should respect prefers-color-scheme light', async ({ page, editPage }) => {
      // Test light mode
      await page.emulateMedia({ colorScheme: 'light' });
      await editPage.start();
      await editPage.checkTheme('light');
    });

    test('should respect prefers-color-scheme dark', async ({ page, editPage }) => {
      // Test dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
      await editPage.start();
      await editPage.checkTheme('dark');
    });

    test('should change themes when clicked', async ({ editPage }) => {
      await editPage.toggleTheme();
      await editPage.checkTheme('dark');
      await editPage.toggleTheme();
      await editPage.checkTheme('light');
    });
  });
});
