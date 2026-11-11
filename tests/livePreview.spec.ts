import type { Page } from '@playwright/test';
import { EditorPage, expect, test } from './test';

const readDiagramViewport = async (page: Page) =>
  await page.locator('#view #container > svg').evaluate((svg: SVGSVGElement) => {
    const viewport = svg.querySelector<SVGGElement>('.svg-pan-zoom_viewport');
    const matrix = viewport?.getCTM();
    if (!viewport || !matrix) {
      throw new Error('Pan/zoom viewport is not initialized');
    }
    const center = new DOMPoint(svg.clientWidth / 2, svg.clientHeight / 2).matrixTransform(
      matrix.inverse()
    );
    const bounds = viewport.getBBox();
    const fitZoom = Math.min(svg.clientWidth / bounds.width, svg.clientHeight / bounds.height);
    return {
      center: { x: center.x, y: center.y },
      zoom: matrix.a / fitZoom
    };
  });

test('keeps a new-tab preview synchronized across editor reloads', async ({ editPage }) => {
  await editPage.clearEditor();
  await editPage.typeInEditor('flowchart LR; A[Initial preview] --> B[Target]');
  await editPage.checkTextInView('Initial preview');

  const preview = await editPage.openLivePreview();
  await expect(preview).toHaveURL(/\/view\?live=[\w-]+#pako:/);
  await expect(preview.locator('#view')).toContainText('Initial preview');

  await editPage.typeInEditor('; B --> C[Updated live]');
  await expect(preview.locator('#view')).toContainText('Updated live');

  await editPage.page.reload();
  await editPage.typeInEditor('; C --> D[Still live]');
  await expect(preview.locator('#view')).toContainText('Still live');
});

test('keeps previews from two editor tabs independent', async ({ editPage }) => {
  const secondPage = await editPage.page.context().newPage();
  const secondEditor = new EditorPage(secondPage);
  await secondEditor.start();

  await editPage.clearEditor();
  await editPage.typeInEditor('flowchart LR; A[First editor] --> B[First target]');
  await secondEditor.clearEditor();
  await secondEditor.typeInEditor('flowchart LR; A[Second editor] --> B[Second target]');
  await editPage.checkTextInView('First editor');
  await secondEditor.checkTextInView('Second editor');

  const firstPreview = await editPage.openLivePreview();
  const secondPreview = await secondEditor.openLivePreview();
  await expect(firstPreview.locator('#view')).toContainText('First editor');
  await expect(secondPreview.locator('#view')).toContainText('Second editor');
  expect(new URL(firstPreview.url()).searchParams.get('live')).not.toBe(
    new URL(secondPreview.url()).searchParams.get('live')
  );

  await editPage.typeInEditor('; B --> C[Only first updated]');
  await expect(firstPreview.locator('#view')).toContainText('Only first updated');
  await expect(secondPreview.locator('#view')).not.toContainText('Only first updated');
});

test('maps the presenter viewport into a differently sized preview', async ({ editPage }) => {
  await editPage.clearEditor();
  await editPage.typeInEditor(
    'flowchart LR; A[One] --> B[Two] --> C[Three] --> D[Four] --> E[Five]'
  );
  await editPage.checkTextInView('Five');
  const preview = await editPage.openLivePreview();
  await expect(preview.locator('#view')).toContainText('Five');

  await editPage.page.getByTitle('Zoom in').click();
  const editorBounds = await editPage.view.boundingBox();
  if (!editorBounds) {
    throw new Error('Editor preview bounds are unavailable');
  }
  const start = {
    x: editorBounds.x + editorBounds.width / 2,
    y: editorBounds.y + editorBounds.height / 2
  };
  await editPage.page.mouse.move(start.x, start.y);
  await editPage.page.mouse.down();
  await editPage.page.mouse.move(start.x + 180, start.y + 90, { steps: 5 });
  await editPage.page.mouse.up();

  await expect
    .poll(async () => {
      const editorViewport = await readDiagramViewport(editPage.page);
      const previewViewport = await readDiagramViewport(preview);
      return {
        centerX: Math.abs(editorViewport.center.x - previewViewport.center.x),
        centerY: Math.abs(editorViewport.center.y - previewViewport.center.y),
        zoom: Math.abs(editorViewport.zoom - previewViewport.zoom)
      };
    })
    .toEqual({
      centerX: expect.closeTo(0, 1),
      centerY: expect.closeTo(0, 1),
      zoom: expect.closeTo(0, 1)
    });
});
