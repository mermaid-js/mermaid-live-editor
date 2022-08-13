import { test, expect } from '@playwright/test';

test('homepage has Playwright in title and get started link linking to the intro page', async ({
	page,
	context
}) => {
	await page.goto(
		'http://localhost:3000/edit?gist=https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a/ec9b4ab0e41e4ff6287326cd3cb47affd7851e19'
	);

	// cy.getLocalStorage('codeStore').snapshot();
	// Expect a title "to contain" a substring.
	await page.locator('"History"').click();
	await page.locator('"Party"').isVisible();
	await page.locator('"Revisions"').isVisible();
	await page.locator('"sidharthv96 v7851e19"').isVisible();
	await page.waitForTimeout(400);
	const storage = await context.storageState();
	expect(JSON.stringify(storage)).toMatchSnapshot();
});
