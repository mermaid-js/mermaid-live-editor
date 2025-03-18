import { expect, test } from '@playwright/test';

test.describe('Editor docs tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/edit');
    await page.getByText('Sample Diagrams').click();
  });

  test('Test default loading', async ({ page }) => {
    await expect(page.locator('[data-cy=docs][href^="https://mermaid.js.org/"]')).toBeVisible();
  });

  test('Test to see if the correct URL loads when changing from one diagram to other', async ({
    page
  }) => {
    await page.getByText('Flow', { exact: true }).click();
    await expect(page.locator('[data-cy=docs][href$="/syntax/flowchart.html"]')).toBeVisible();

    await page.getByText('Config').click();
    await expect(
      page.locator('[data-cy=docs][href$="/syntax/flowchart.html#configuration"]')
    ).toBeVisible();

    await page.getByText('Sequence').click();
    await expect(
      page.locator('[data-cy=docs][href$="/syntax/sequenceDiagram.html#configuration"]')
    ).toBeVisible();

    await page.getByText('Code', { exact: true }).click();
    await expect(
      page.locator('[data-cy=docs][href$="/syntax/sequenceDiagram.html"]')
    ).toBeVisible();
  });

  test("Test to check URLs for a case where config URL doesn't exist", async ({ page }) => {
    await page.getByText('State').click();
    await expect(page.locator('[data-cy=docs][href$="/syntax/stateDiagram.html"]')).toBeVisible();

    await page.getByText('Config').click();
    await expect(page.locator('[data-cy=docs][href$="/syntax/stateDiagram.html"]')).toBeVisible();
  });
});
