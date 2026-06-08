import { expect, test, type Page } from '@playwright/test';
import { typeInEditor } from './utils';

const config = '{\n  "theme": "default"\n}';

const entry = (id: string, name: string, type: 'manual' | 'auto', label: string) => ({
  id,
  name,
  type,
  time: Number(id.slice(2)),
  state: {
    code: `flowchart TD\n  A[${label}]`,
    mermaid: config,
    autoSync: true,
    updateDiagram: false
  }
});

const manualHistory = [
  entry('m-2', 'hollow-art', 'manual', 'Halloween'),
  entry('m-1', 'helpful-ocean', 'manual', 'Pumpkin')
];
const autoHistory = [
  entry('a-2', 'barking-dog', 'auto', 'NewYear'),
  entry('a-1', 'needy-mosquito', 'auto', 'Fireworks')
];

const openHistory = (page: Page) => page.getByRole('button', { name: 'History' }).click();

test.describe('History', () => {
  test.beforeEach(async ({ page }) => {
    // Freeze time so auto-save snapshots are deterministic.
    await page.addInitScript(() => {
      Object.defineProperty(Date, 'now', { value: () => new Date(2022, 0, 1).getTime() });
    });
    await page.goto('/edit');
  });

  test('loads Saved and Timeline history from localStorage and restores entries', async ({
    page
  }) => {
    await page.evaluate(
      ([manual, auto]) => {
        localStorage.setItem('manualHistoryStore', manual);
        localStorage.setItem('autoHistoryStore', auto);
      },
      [JSON.stringify(manualHistory), JSON.stringify(autoHistory)]
    );
    await page.reload();
    await openHistory(page);

    // Saved tab is active by default.
    await expect(page.locator('#historyList li')).toHaveCount(2);
    await expect(page.locator('#historyList')).toContainText('hollow-art');
    await expect(page.locator('#historyList')).toContainText('helpful-ocean');

    await page.getByRole('button', { name: 'Restore this version' }).first().click();
    await expect(page.locator('#view')).toContainText('Halloween');

    // Switching to the Timeline tab shows the auto entries only.
    await page.getByRole('tab', { name: 'Timeline' }).click();
    await expect(page.locator('#historyList li')).toHaveCount(2);
    await expect(page.locator('#historyList')).toContainText('barking-dog');
    await expect(page.locator('#historyList')).toContainText('needy-mosquito');
    await expect(page.locator('#historyList')).not.toContainText('hollow-art');

    await page.getByRole('button', { name: 'Restore this version' }).first().click();
    await expect(page.locator('#view')).toContainText('NewYear');
  });

  test('keeps the active tab highlighted when switching modes', async ({ page }) => {
    await openHistory(page);
    const saved = page.getByRole('tab', { name: 'Saved' });
    const timeline = page.getByRole('tab', { name: 'Timeline' });

    await expect(saved).toHaveClass(/border-b-2/);
    await expect(timeline).not.toHaveClass(/border-b-2/);

    await timeline.click();
    await expect(timeline).toHaveClass(/border-b-2/);
    await expect(saved).not.toHaveClass(/border-b-2/);
  });

  test('saves the current state and reports duplicates', async ({ page }) => {
    await openHistory(page);
    await expect(page.locator('#historyList li')).toHaveCount(0);

    await page.locator('#saveHistory').click();
    await expect(page.locator('#historyList li')).toHaveCount(1);

    // Saving again without changes does not add a duplicate and notifies the user.
    await page.locator('#saveHistory').click();
    await expect(page.getByText('State already saved.')).toBeVisible();
    await expect(page.locator('#historyList li')).toHaveCount(1);

    // A real edit produces a new entry.
    await typeInEditor(page, '  Z[Extra]', { newline: true });
    await page.locator('#saveHistory').click();
    await expect(page.locator('#historyList li')).toHaveCount(2);
  });

  test('auto-saves to the Timeline only, never the Saved list', async ({ page }) => {
    await openHistory(page);
    await page.locator('#saveHistory').click();
    await expect(page.locator('#historyList li')).toHaveCount(1);

    await page.getByRole('tab', { name: 'Timeline' }).click();
    // A manual save must not appear under Timeline.
    await expect(page.locator('#historyList')).toContainText('No timeline snapshots yet.');
  });

  test('deletes a single entry and clears all after confirmation', async ({ page }) => {
    await openHistory(page);
    await page.locator('#saveHistory').click();
    await typeInEditor(page, '  Z[Another]', { newline: true });
    await page.locator('#saveHistory').click();
    await expect(page.locator('#historyList li')).toHaveCount(2);

    await page.getByRole('button', { name: 'Delete this version' }).first().click();
    await expect(page.locator('#historyList li')).toHaveCount(1);

    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('#clearHistory').click();
    await expect(page.locator('#historyList li')).toHaveCount(0);
    await expect(page.locator('#historyList')).toContainText('No saved states yet.');
  });
});
