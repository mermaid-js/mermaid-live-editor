import { expect, test } from './test';

const routeLocalAI = async (page: import('@playwright/test').Page, code: string) => {
  await page.route(/\/chat\/completions$/, async (route) => {
    const body = [
      {
        choices: [
          {
            delta: {
              content: 'I found a valid Mermaid fix.'
            }
          }
        ]
      },
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_1',
                  type: 'function',
                  function: {
                    name: 'updateDiagram',
                    arguments: ''
                  }
                }
              ]
            }
          }
        ]
      },
      {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  function: {
                    arguments: JSON.stringify({ code })
                  }
                }
              ]
            }
          }
        ]
      }
    ]
      .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
      .join('');

    await route.fulfill({
      body: `${body}data: [DONE]\n\n`,
      contentType: 'text/event-stream'
    });
  });
};

const routeLocalAIWithCodeBlock = async (page: import('@playwright/test').Page, code: string) => {
  await page.route(/\/chat\/completions$/, async (route) => {
    const body = `data: ${JSON.stringify({
      choices: [
        {
          delta: {
            content: `Use this corrected Mermaid code:\n\n\`\`\`mermaid\n${code}\n\`\`\``
          }
        }
      ]
    })}\n\ndata: [DONE]\n\n`;

    await route.fulfill({
      body,
      contentType: 'text/event-stream'
    });
  });
};

const routeLocalAIWithReplacementText = async (page: import('@playwright/test').Page) => {
  await page.route(/\/chat\/completions$/, async (route) => {
    const body = `data: ${JSON.stringify({
      choices: [
        {
          delta: {
            content: 'I have corrected the typo `flowart` to `flowchart` to fix the syntax error.'
          }
        }
      ]
    })}\n\ndata: [DONE]\n\n`;

    await route.fulfill({
      body,
      contentType: 'text/event-stream'
    });
  });
};

test.describe('Local AI chat', () => {
  test('requires full updated code for ordinary edit requests', async ({ page }) => {
    const sentPrompts: string[] = [];
    await page.route(/\/chat\/completions$/, async (route) => {
      const request = route.request().postDataJSON() as {
        messages: { role: string; content: string }[];
      };
      sentPrompts.push(request.messages.at(-1)?.content ?? '');

      await route.fulfill({
        body: `data: ${JSON.stringify({
          choices: [{ delta: { content: 'I updated the diagram.' } }]
        })}\n\ndata: [DONE]\n\n`,
        contentType: 'text/event-stream'
      });
    });

    await page.goto('/edit');
    await page.getByLabel('Local AI chat').click();
    await page
      .getByPlaceholder('Ask local AI about this diagram')
      .fill('Add 10 other similar entities below "let me think"');
    await page.keyboard.press('Enter');

    await expect
      .poll(() => sentPrompts[0] ?? '')
      .toContain('Return a full updated Mermaid diagram');
    expect(sentPrompts[0]).toContain('Do not respond with only an explanation');
    await expect(
      page.getByText('This is an edit request. Return a full updated Mermaid diagram')
    ).toBeHidden();
  });

  test('retries ordinary edit requests when the model responds without code', async ({ page }) => {
    const requests: string[] = [];
    const requestTools: unknown[] = [];
    await page.route(/\/chat\/completions$/, async (route) => {
      const request = route.request().postDataJSON() as {
        messages: { role: string; content: string }[];
        tools?: unknown[];
      };
      requests.push(request.messages.at(-1)?.content ?? '');
      requestTools.push(request.tools);

      if (requests.length === 1) {
        await route.fulfill({
          body: `data: ${JSON.stringify({
            choices: [
              {
                delta: {
                  content:
                    'I have added 10 more shopping items as branches from the "Let me think" decision node.'
                }
              }
            ]
          })}\n\ndata: [DONE]\n\n`,
          contentType: 'text/event-stream'
        });
        return;
      }

      const code = `flowchart TD
  A["Let me think"] --> B["Watch"]
  A --> C["Headphones"]
  A --> D["Gaming Console"]
  A --> E["Tablet"]
  A --> F["Camera"]
  A --> G["Shoes"]
  A --> H["Coffee Maker"]
  A --> I["Bike"]
  A --> J["Smart Watch"]
  A --> K["Sunglasses"]`;

      await route.fulfill({
        body: `data: ${JSON.stringify({
          choices: [
            {
              delta: {
                content: `Here is the updated diagram:\n\n\`\`\`mermaid\n${code}\n\`\`\``
              }
            }
          ]
        })}\n\ndata: [DONE]\n\n`,
        contentType: 'text/event-stream'
      });
    });

    await page.goto('/edit');
    await page.getByLabel('Local AI chat').click();
    await page
      .getByPlaceholder('Ask local AI about this diagram')
      .fill('Add 10 other similar entities below "let me think"');
    await page.keyboard.press('Enter');

    await expect.poll(() => requests).toHaveLength(2);
    expect(requests[1]).toContain('return the full updated diagram only');
    expect(requestTools[1]).toBeUndefined();
    await expect(page.getByText('Proposed diagram change')).toBeVisible();
    await expect(page.getByText('Validation passed')).toBeVisible();
  });

  test('opens chat, validates a local AI proposal, and accepts it', async ({ editPage, page }) => {
    await routeLocalAI(page, 'graph TD\n  A --> B');

    await page.getByLabel('Local AI chat').click();
    await expect(page.getByText('Local AI Assistant')).toBeVisible();

    await page.getByPlaceholder('Ask local AI about this diagram').fill('Make this a simple graph');
    await page.keyboard.press('Enter');

    await expect(page.getByText('I found a valid Mermaid fix.')).toBeVisible();
    await expect(page.getByText('Proposed diagram change')).toBeVisible();
    await expect(page.getByText('Validation passed')).toBeVisible();

    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.getByText('Accepted')).toBeVisible();
    await editPage.checkInEditor('A --> B');
  });

  test('accepts a Mermaid code block fallback from a local model', async ({ editPage, page }) => {
    await routeLocalAIWithCodeBlock(page, 'graph TD\n  A --> C');

    await page.getByLabel('Local AI chat').click();
    await page.getByPlaceholder('Ask local AI about this diagram').fill('Fix this');
    await page.keyboard.press('Enter');

    await expect(page.getByText('Proposed diagram change')).toBeVisible();
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.getByText('Accepted')).toBeVisible();
    await editPage.checkInEditor('A --> C');
  });

  test('creates an acceptable proposal from a textual typo correction', async ({
    editPage,
    page
  }) => {
    await routeLocalAIWithReplacementText(page);

    await editPage.clearEditor();
    await editPage.typeInEditor('flowart TD\nA --> B');
    await editPage.checkError('Syntax error');

    await page.getByTestId('ai-repair-button').click();

    await expect(page.getByText('Proposed diagram change')).toBeVisible();
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.getByText('Accepted')).toBeVisible();
    await editPage.checkInEditor('flowchart TD');
  });

  test('starts syntax repair from the error banner and preserves diagram on chat clear', async ({
    editPage,
    page
  }) => {
    await routeLocalAI(page, 'graph TD\n  A --> B');

    await editPage.clearEditor();
    await editPage.typeInEditor('graph TD\nA --> B -->');
    await editPage.checkError('Syntax error');

    await page.getByTestId('ai-repair-button').click();

    await expect(page.getByText('Local AI Assistant')).toBeVisible();
    await expect(page.getByText('I found a valid Mermaid fix.')).toBeVisible();
    await expect(page.getByText('Proposed diagram change')).toBeVisible();

    await page.getByTitle('Clear chat').click();
    await expect(page.getByText('Ask local AI to explain')).toBeVisible();
    await editPage.checkInEditor('A --> B -->');
  });
});
