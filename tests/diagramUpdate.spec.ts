import { test } from './test';

test.describe('Auto sync tests', () => {
  test('should automatically defer rendering when complex diagrams are edited', async ({
    editPage
  }) => {
    await editPage.typeInEditor(
      `
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K
A & B & C & D & E --> F & G & H & I & J & K & LongTest`
    );
    await editPage.checkTextNotInView('LongTest');
    await editPage.checkTextInView('LongTest');
  });

  test('supports commenting code out/in', async ({ editPage }) => {
    await editPage.toggleComment('fa-car');
    await editPage.checkTextNotInView('Car');
    await editPage.toggleComment('fa-car');
    await editPage.checkTextInView('Car');
  });

  test('supports editing code when code is incorrect', async ({ editPage }) => {
    await editPage.start(
      '/edit#pako:eNpljjEKwzAMRa8SNOcEnlt6gK5eVFvYJsgOqkwpIXevg9smEE1PnyfxF3DFExgISW-CczQ2D21cYU7a-SGYXRwyvTp9jUhuKlVP-eHy7zA-leQsMEmg_QOM0BLG5FujZVMsaCQmC6ahR5ks2Lw2r84ela4-aREwKpVGwKrl_s7ut3fnkjAIcg_XDzuaUhs'
    );
    await editPage.typeInEditor('branch test', { bottom: true, newline: true });
    await editPage.checkTextNotInView('test');
    await editPage.checkInEditor('branch test');
    await editPage.checkError('Error: Trying to checkout branch which is not yet created.');
  });

  test('should update diagram after entire text is removed', async ({ editPage }) => {
    await editPage.clearEditor();
    await editPage.typeInEditor(
      `graph LR
	A-->Bike`
    );
    await editPage.checkTextInView('Bike');
  });
});
