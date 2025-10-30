import { expect, test } from '@playwright/test';
import { typeInEditor } from './utils';

test.describe.skip('Save History', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Date, 'now', {
        value: () => new Date(2022, 0, 1).getTime()
      });
    });
    await page.goto('/edit');
    await page.getByText('History').click();
  });

  test('should load history from localstorage', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem(
        'manualHistoryStore',
        '[{"state":{"code":"graph TD\\n    A[Halloween] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":false},"time":0,"type":"manual","id":"d7ea820e-21dd-418a-b984-fd58acde09df","name":"hollow-art"},{"state":{"code":"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":true},"time":0,"type":"manual","id":"b749ffc6-522b-4a44-86cf-7c1ffc3146b3","name":"helpful-ocean"}]'
      );
      localStorage.setItem(
        'autoHistoryStore',
        '[{"state":{"code":"graph TD\\n    A[New Year] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":false},"time":0,"type":"auto","id":"69ea820e-522b-4a44-86cf-fd58acde09df","name":"barking-dog"},{"state":{"code":"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":true},"time":0,"type":"manual","id":"x749ffc6-21dd-418a-b984-7c1ffc3146b3","name":"needy-mosquito"}]'
      );
    });
    await page.reload();
    await page.getByText('History').click();
    await expect(page.locator('#historyList li')).toHaveCount(2);
    await expect(page.locator('#historyList').getByText('No items in History')).not.toBeVisible();
    await expect(page.locator('#historyList')).toContainText('helpful-ocean');
    await expect(page.locator('#historyList')).toContainText('hollow-art');
    await page.getByText('Restore').first().click();
    await expect(page.locator('#view').getByText('Halloween')).toBeVisible();
    await page.getByText('Timeline').click();

    await expect(page.locator('#historyList li')).toHaveCount(2);
    await expect(page.locator('#historyList').getByText('No items in History')).not.toBeVisible();
    await expect(page.locator('#historyList')).toContainText('needy-mosquito');
    await expect(page.locator('#historyList')).toContainText('barking-dog');
    await page.getByText('Restore').first().click();
    await expect(page.locator('#view').getByText('New Year')).toBeVisible();
  });

  test.skip('should save when clicked', async ({ page }) => {
    await expect(page.locator('#historyList li')).toHaveCount(0);
    await expect(page.locator('#historyList')).toContainText('No items in History');
    await page.locator('#saveHistory').click();
    await expect(page.locator('#historyList').getByText('No items in History')).not.toBeVisible();
    await expect(page.locator('#historyList li')).toHaveCount(1);
    const dialogPromise = page.waitForEvent('dialog');
    await page.locator('#saveHistory').click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('State already saved.');
    await dialog.accept();

    await typeInEditor(page, '  C --> HistoryTest');
    await page.locator('#saveHistory').click();
    await expect(page.locator('#historyList li')).toHaveCount(2);
  });

  test.skip('should be able to restore and delete', async ({ page }) => {
    await page.locator('#saveHistory').click();
    await typeInEditor(page, '  C --> HistoryTest');
    await expect(page.locator('#historyList').getByText('No items in History')).not.toBeVisible();
    await expect(page.locator('#historyList li')).toHaveCount(1);
    await expect(page.locator('#view').getByText('HistoryTest')).toBeVisible();
    await page.getByText('Restore').click();
    await expect(page.locator('#view').getByText('HistoryTest')).not.toBeVisible();
    await page.getByText('Delete').click();
    await expect(page.locator('#historyList li')).toHaveCount(0);
    await expect(page.locator('#historyList')).toContainText('No items in History');
    await page.locator('#saveHistory').click();
    await typeInEditor(page, '  C --> HistoryTest');
    await page.locator('#saveHistory').click();
    await page.locator('#editor').type('ing');
    await page.locator('#clearHistory').click();

    const dialog = await page.waitForEvent('dialog');
    expect(dialog.message()).toBe('Clear all saved items?');
    await dialog.accept();

    await expect(page.locator('#historyList')).toContainText('No items in History');
  });
});
