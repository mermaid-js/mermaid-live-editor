import { expect, test } from '@playwright/test';

test.describe('Test themes', () => {
  test.describe('Test color scheme preference', () => {
    test('should respect prefers-color-scheme light', async ({ page }) => {
      // Test light mode
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/edit');
      await expect(page.getByText('light').locator('..')).toHaveClass(/bordered/);
      await expect(page.getByText('dark').locator('..')).not.toHaveClass(/bordered/);
    });

    test('should respect prefers-color-scheme dark', async ({ page }) => {
      // Test dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/edit');
      await expect(page.getByText('dark').locator('..')).toHaveClass(/bordered/);
      await expect(page.getByText('light').locator('..')).not.toHaveClass(/bordered/);
    });
  });

  test.describe('Test light themes', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 768 });
      await page.goto('/edit');
      await page.getByText('Theme').click();
    });

    test('should set light theme as default', async ({ page }) => {
      await expect(page.getByText('light').locator('..')).toHaveClass(/bordered/);
      await expect(page.getByText('dark').locator('..')).not.toHaveClass(/bordered/);
      const themeStore = await page.evaluate(() => localStorage.getItem('themeStore'));
      expect(themeStore).toBeTruthy();
    });

    test('should change themes when clicked', async ({ page }) => {
      await expect(page.getByText('light').locator('..')).toHaveClass(/bordered/);
      await page.getByText('cupcake').click();
      await expect(page.getByText('cupcake').locator('..')).toHaveClass(/bordered/);
      await expect(page.getByText('light').locator('..')).not.toHaveClass(/bordered/);
      await expect(page.getByText('dark').locator('..')).not.toHaveClass(/bordered/);
      const themeStore = await page.evaluate(() => localStorage.getItem('themeStore'));
      expect(themeStore).toBeTruthy();
    });
  });
});
