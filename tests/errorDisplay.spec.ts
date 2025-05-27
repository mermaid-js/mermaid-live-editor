import { test } from './test';

test.describe('Error display tests', () => {
  test('should show AI Repair button for syntax errors in Code tab', async ({ editPage }) => {
    // Enter code with syntax error
    await editPage.clearEditor();
    await editPage.typeInEditor('graph TD\nA --> B -->');

    // Verify error is displayed
    await editPage.checkError('Syntax error');

    // Verify AI Repair button and help text is shown in Code tab
    await editPage.checkAIHelperVisibility(true);
  });

  test('should not show AI Repair button for errors in Config tab', async ({ editPage }) => {
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

    // Verify AI Repair button and help text is NOT shown in Config tab
    await editPage.checkAIHelperVisibility(false);
  });
});
