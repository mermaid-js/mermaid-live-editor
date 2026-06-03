import { test } from './test';

test.describe('Error display tests', () => {
  test('should show a syntax error for invalid code in the Code tab', async ({ editPage }) => {
    // Enter code with syntax error
    await editPage.clearEditor();
    await editPage.typeInEditor('graph TD\nA --> B -->');

    // Verify error is displayed
    await editPage.checkError('Syntax error');
  });

  test('should show a syntax error for invalid JSON in the Config tab', async ({ editPage }) => {
    // First enter valid diagram
    await editPage.clearEditor();
    await editPage.typeInEditor('graph TD\nA --> B');

    // Switch to Config tab
    await editPage.setEditorMode('Config');

    // Enter invalid JSON in config
    await editPage.clearEditor();
    await editPage.typeInEditor('{\n  "theme": "default",\n  invalid json');

    // Verify error is displayed
    await editPage.checkError('Syntax error');
  });
});
