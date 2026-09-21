import type { State } from '$/types';
import assert from 'node:assert';
import { expect, test } from './test';

test.describe('Site Loads', () => {
  test('Check Home page load', async ({ editPage }) => {
    await editPage.setEditorMode('Config');
    const codeStore = await editPage.page.evaluate(() => localStorage.getItem('codeStore'));
    expect(codeStore).toBeTruthy();
  });

  test('should keep code after reload', async ({ editPage, page }) => {
    await editPage.checkInEditor('Car');
    await editPage.checkTextInView('Car');
    await page.reload();
    await editPage.checkInEditor('Car');
    await editPage.checkTextInView('Car');
  });

  test('Check Redirect from old URL', async ({ page, editPage }) => {
    await editPage.start(
      '/#/edit/eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW0NocmlzdG1hc10gLS0-fEdldCBtb25leXwgQihHbyBzaG9wcGluZylcbiAgICBCIC0tPiBDe0xldCBtZSB0aGlua31cbiAgICBDIC0tPnxPbmV8IERbTGFwdG9wXVxuICAgIEMgLS0-fFR3b3wgRVtpUGhvbmVdXG4gICAgQyAtLT58VGhyZWV8IEZbZmE6ZmEtY2FyIENhcl0iLCJtZXJtYWlkIjp7InRoZW1lIjoiZGVmYXVsdCJ9LCJ1cGRhdGVFZGl0b3IiOmZhbHNlfQ'
    );
    await expect(page).toHaveURL(/.*\/edit#pako:eNp/);
  });

  test('should load sample diagrams when clicked', async ({ editPage }) => {
    await editPage.toggleSampleDiagrams();
    await editPage.loadSampleDiagram('Pie');
    await editPage.checkInEditor('pie title Pets adopted by volunteers');
    await editPage.checkTextInView('Pets adopted by volunteers');
    await editPage.loadSampleDiagram('Class');
    await editPage.checkInEditor('classDiagram');
  });

  test.describe.skip('github', () => {
    test('should load diagram from gist', async ({ editPage, page }) => {
      await editPage.start(
        `/edit?gist=https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a`
      );
      await page.getByText('History').click();
      await editPage.checkTextInView('Go shopping!!');
      await expect(page.getByText('Revisions')).toBeVisible();
      await expect(page.getByText('sidharthv96 v8f8f1e2')).toBeVisible();
      await expect(page.getByText('sidharthv96 v7851e19')).toBeVisible();
      const codeStore = await page.evaluate(() => localStorage.getItem('codeStore'));
      expect(codeStore).toBeTruthy();
    });

    test('should load diagram from gist revision', async ({ editPage, page }) => {
      await editPage.start(
        '/edit?gist=https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a/ec9b4ab0e41e4ff6287326cd3cb47affd7851e19'
      );
      await page.getByText('History').click();
      await editPage.checkTextInView('Party');
      await expect(page.getByText('Revisions')).toBeVisible();
      await expect(page.getByText('sidharthv96 v7851e19')).toBeVisible();
      const codeStore = await page.evaluate(() => localStorage.getItem('codeStore'));
      expect(codeStore).toBeTruthy();
    });

    test('should load diagram from raw files', async ({ editPage, page }) => {
      await editPage.start(
        '/edit?code=https://gist.githubusercontent.com/sidharthv96/6268a23e673a533dcb198f241fd7012a/raw/4eb03887e6a41397e80bdcdbf94017c498f8f1e2/code.mmd&config=https://gist.githubusercontent.com/sidharthv96/6268a23e673a533dcb198f241fd7012a/raw/4eb03887e6a41397e80bdcdbf94017c498f8f1e2/config.json'
      );
      await editPage.checkTextInView('Party');
      const codeStore = await page.evaluate(() => localStorage.getItem('codeStore'));
      expect(codeStore).toBeTruthy();
    });
  });

  test('should prompt user to scrub unsafe config', async ({ editPage, page }) => {
    let dialogAccepted = false;
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('from the config for safety');
      await dialog.accept();
      dialogAccepted = true;
    });
    await editPage.start(
      `/edit?${new URLSearchParams({
        code: `data:application/vnd.mermaid,${encodeURIComponent('flowchart TD\nHello-->World')}`,
        config: `data:application/json,${encodeURIComponent(
          JSON.stringify({
            someOtherSetting: 'Test value',
            securityLevel: 'loose',
            secure: [],
            themeVariables: {
              nodeBorder: '</style></svg><script>alert("XSS")</script>'
            }
          })
        )}`
      }).toString()}`
    );
    await editPage.checkTextInView('Hello');
    await expect.poll(() => dialogAccepted).toBeTruthy();
    const codeStore = await page.evaluate(() => localStorage.getItem('codeStore'));
    assert(codeStore);
    const parsedStore = JSON.parse(codeStore) as State;
    const parsedConfig = JSON.parse(parsedStore.mermaid) as Record<string, unknown>;
    expect(parsedConfig).toEqual({
      someOtherSetting: 'Test value',
      // The editor fills in the diagram type's default theme (a flowchart here).
      theme: 'redux-color',
      themeVariables: {}
    });
    // should scrub unsafe securityLevel but keep other settings
    expect(parsedConfig.securityLevel).toBeUndefined();
    expect(parsedConfig.secure).toBeUndefined();
  });

  test('should show troubleshooting steps if loading fails', async ({ editPage, page }) => {
    await editPage.start('/#/edit/eyJjb2RlIjoiZ3JhcGggVERcbiAg');
    await page.reload({ waitUntil: 'networkidle' });
    await editPage.checkTextInView('Please Click here to Raise an issue in github.');
  });

  test('should show Contact sales before Save diagram', async ({ editPage }) => {
    const { page } = editPage;
    const history = page.getByRole('button', { name: 'History' });
    const share = page.getByRole('button', { name: 'Share' });
    const saveDiagram = page.getByRole('link', { name: 'Save diagram' });
    const contactSales = page.getByRole('link', { name: 'Contact sales' });

    await expect(contactSales).toBeVisible();
    await expect(contactSales.getByRole('img', { name: 'Mermaid Chart' })).toBeVisible();
    await expect(contactSales).toHaveAttribute('target', '_blank');

    const href = await contactSales.getAttribute('href');
    assert(href);
    const contactSalesUrl = new URL(href);
    expect(contactSalesUrl.origin + contactSalesUrl.pathname).toBe('https://mermaid.ai/contact-us');
    expect(contactSalesUrl.searchParams.get('contactSubject')).toBe('contactSales');
    expect(contactSalesUrl.searchParams.get('utm_source')).toBe('mermaid_live_editor');
    expect(contactSalesUrl.searchParams.get('utm_medium')).toBe('button');
    expect(contactSalesUrl.searchParams.get('utm_campaign')).toBe('contact_sales');

    const historyBox = await history.boundingBox();
    const shareBox = await share.boundingBox();
    const saveBox = await saveDiagram.boundingBox();
    const contactBox = await contactSales.boundingBox();
    assert(historyBox);
    assert(shareBox);
    assert(saveBox);
    assert(contactBox);
    expect(historyBox.x).toBeLessThan(shareBox.x);
    expect(shareBox.x).toBeLessThan(contactBox.x);
    expect(contactBox.x).toBeLessThan(saveBox.x);
  });
});

test.describe('Verify types of URLs', () => {
  test('should load compressed URL', async ({ editPage }) => {
    await editPage.start(
      '/edit#pako:eNpVkM2KwkAQhF-l6dMK5gVyEDRxvYi7sF6WjIcm0zqDzg_jBJEk725Hd2G3Tw31VVFUj23QjCWeEkUD-1p5kFs2O77BN1M6QFEshg1ncMHzfYDV2ybA1YQYrT_NXvhqgqDqtxPGkI315_ElVU__h-cB6mZLMYd4-Kvsb2GAdWM_jcT_V0xicb03RyqPVLSUoJI-OEfHyZHV0rqfDAqzYccKS3k1pbNC5Ufhuqgp81rbHBJKxuXKc6Quh6-7b7HMqeNfqLYkC7gfanwAlW1ZvQ'
    );
    await editPage.checkTextInView('New Year');
    await editPage.start(
      '/edit#pako:eNptkU1PwzAMhv9K5BOI9Q9EXBDbJA477YYqITcxndV8QD40weh_Jy1rGR0-OY_tV2_sEyivCSQogzGuGduAtnaixINji0bcf1WVWGfVXdMtx8M1faYm4B8sxR27JLClJd6nwK4VLTlN4bI4jMQd2pLe3C4KFhNNcLQ92jv9ADGLNoTdozc-zIV4ZDsNlud7RtVN7_5Sb_jYrFcN3iN_0pPbEqUZK3QbTP_Ojyv4NdR4bwTHlyMbPcOQ3WJ2CliBpWCRdbnLqFJDOpClGmRJNYauhtr1pS-_6bKMjebkA8hXNJFWgDn5_YdTIFPINDWdb3vu6r8BaWOZRQ'
    );
    await editPage.checkTextInView('Animal');
  });

  test.describe('Uncompressed URLs', () => {
    test('should load URL without specifier', async ({ editPage }) => {
      await editPage.start(
        '/edit/#eyJjb2RlIjoiZ3JhcGhcbiAgICBUZXN0TGFiZWwiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGVmYXVsdFwiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ'
      );
      await editPage.checkTextInView('TestLabel');
      await editPage.start(
        '/edit#eyJjb2RlIjoiY2xhc3NEaWFncmFtXG4gICAgQW5pbWFsIDx8LS0gRHVja1xuICAgIEFuaW1hbCA8fC0tIEZpc2hcbiAgICBBbmltYWwgPHwtLSBaZWJyYVxuICAgIEFuaW1hbCA6ICtpbnQgYWdlXG4gICAgQW5pbWFsIDogK1N0cmluZyBnZW5kZXJcbiAgICBBbmltYWw6ICtpc01hbW1hbCgpXG4gICAgQW5pbWFsOiArbWF0ZSgpXG4gICAgY2xhc3MgRHVja3tcbiAgICAgICtTdHJpbmcgYmVha0NvbG9yXG4gICAgICArc3dpbSgpXG4gICAgICArcXVhY2soKVxuICAgIH1cbiAgICBjbGFzcyBGaXNoe1xuICAgICAgLWludCBzaXplSW5GZWV0XG4gICAgICAtY2FuRWF0KClcbiAgICB9XG4gICAgY2xhc3MgWmVicmF7XG4gICAgICArYm9vbCBpc193aWxkXG4gICAgICArcnVuKClcbiAgICB9XG4gICAgICAgICAgICAiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGFya1wiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ'
      );
      await editPage.checkTextInView('Animal');
    });

    test('should load URL with "base64" specifier', async ({ editPage }) => {
      await editPage.start(
        '/edit/#base64:eyJjb2RlIjoiZ3JhcGhcbiAgICBUZXN0TGFiZWwiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGVmYXVsdFwiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ'
      );
      await editPage.checkTextInView('TestLabel');
    });
  });
});
