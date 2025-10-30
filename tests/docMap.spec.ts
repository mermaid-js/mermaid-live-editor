import { test } from './test';

test.describe('Editor docs tests', () => {
  test.beforeEach(async ({ editPage }) => {
    await editPage.toggleSampleDiagrams();
  });

  test('Test default loading', async ({ editPage }) => {
    await editPage.checkDocURL(/mermaid\.js\.org\//);
  });

  test('Test to see if the correct URL loads when changing from one diagram to other', async ({
    editPage
  }) => {
    await editPage.loadSampleDiagram('Flowchart');
    await editPage.checkDocURL(/syntax\/flowchart\.html/);
    await editPage.setEditorMode('Config');
    await editPage.checkDocURL(/syntax\/flowchart\.html#configuration/);
    await editPage.setEditorMode('Code');
    await editPage.checkDocURL(/syntax\/flowchart\.html/);

    await editPage.loadSampleDiagram('Sequence');
    await editPage.checkDocURL(/syntax\/sequenceDiagram\.html/);
    await editPage.setEditorMode('Config');
    await editPage.checkDocURL(/syntax\/sequenceDiagram\.html#configuration/);
    await editPage.setEditorMode('Code');
    await editPage.checkDocURL(/syntax\/sequenceDiagram\.html/);
  });

  test("Test to check URLs for a case where config URL doesn't exist", async ({ editPage }) => {
    await editPage.loadSampleDiagram('State');
    await editPage.checkDocURL(/syntax\/stateDiagram\.html/);
    await editPage.setEditorMode('Config');
    await editPage.checkDocURL(/syntax\/stateDiagram\.html/);
    await editPage.setEditorMode('Code');
    await editPage.checkDocURL(/syntax\/stateDiagram\.html/);
  });
});
