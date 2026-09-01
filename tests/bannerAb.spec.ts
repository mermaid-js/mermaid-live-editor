import { C, TID } from '$/constants';
import { BANNER_AB_KEY } from '$/util/promos/bannerAb';
import type { Page } from '@playwright/test';
import { expect, test } from './test';

const seedBanner = async (page: Page, variant: 'control' | 'testB') => {
  await page.addInitScript(
    ({ dismissedKey, variantKey, variant }) => {
      localStorage.setItem(dismissedKey, 'true');
      localStorage.setItem(variantKey, JSON.stringify(variant));
    },
    {
      dismissedKey: C.editorChooserDismissedKey,
      variant,
      variantKey: BANNER_AB_KEY
    }
  );
  await page.goto('/edit');
};

test.describe('Banner A/B', () => {
  test('control keeps the discount banner and checkout UTMs', async ({ page }) => {
    await seedBanner(page, 'control');
    const banner = page.getByTestId(TID.promoBanner);
    await expect(banner).toContainText('OSS users get 10% off with code JS26');
    await expect(banner.locator('a')).toHaveAttribute('href', /utm_campaign=oss_coupon/);
    await expect(banner.locator('a')).toHaveAttribute('href', /utm_medium=banner_ad/);
    await expect(banner.locator('a')).toHaveAttribute('href', /utm_source=mermaid_live_editor/);
  });

  test('testB shows the visual-editor CTA and sign-up UTMs', async ({ page }) => {
    await seedBanner(page, 'testB');
    const banner = page.getByTestId(TID.promoBanner);
    await expect(banner).toContainText(
      'Use the Visual Editor in Mermaid to edit diagrams with your mouse'
    );
    await expect(banner.getByRole('button', { name: 'Try it now' })).toBeVisible();
    await expect(banner.locator('a')).toHaveAttribute('href', /\/app\/sign-up/);
    await expect(banner.locator('a')).toHaveAttribute('href', /utm_campaign=visual_testB/);
    await expect(banner.locator('a')).toHaveAttribute('href', /utm_medium=banner_ad/);
    await expect(banner.locator('a')).toHaveAttribute('href', /utm_source=mermaid_live_editor/);
  });
});
