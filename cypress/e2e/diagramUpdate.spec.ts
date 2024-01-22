import { typeInEditor, cmd } from './util';

describe('Auto sync tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.url().should('contain', '/edit#pako');
    cy.window().should('have.property', 'editorLoaded', true);
  });

  it('should dim diagram when code is edited', () => {
    cy.contains('Auto sync').click();
    cy.get('#view').should('not.have.class', 'outOfSync');
    cy.get('#errorContainer').should('not.exist');
    typeInEditor('  C --> Test', { bottom: true });
    cy.get('#view').should('have.class', 'outOfSync');
    cy.get('#errorContainer').should('contain.text', 'Diagram out of sync.');
    cy.getLocalStorage('codeStore').snapshot();
  });

  it('should update diagram when shortcut is used', () => {
    cy.contains('Auto sync').click();
    cy.get('#view').should('not.have.class', 'outOfSync');
    typeInEditor('  C --> Test');
    cy.get('#view').should('have.class', 'outOfSync');
    cy.get('#errorContainer').should('contain.text', 'Diagram out of sync.');
    typeInEditor(`${cmd}{enter}`);
    cy.get('#errorContainer').should('not.exist');
    cy.get('#view').should('not.have.class', 'outOfSync');
  });

  it('should show/hide sync button with auto sync', () => {
    cy.get('[data-cy=sync]').should('not.exist');
    cy.contains('Auto sync').click();
    cy.get('[data-cy=sync]').should('exist');
    cy.get('#autoSync').check();
    cy.get('[data-cy=sync]').should('not.exist');
  });

  it('should not dim diagram when code is in sync', () => {
    cy.contains('Auto sync').click();
    cy.get('#view').should('not.have.class', 'outOfSync');
    typeInEditor('  C --> Test');
    cy.get('#view').should('have.class', 'outOfSync');
    cy.get('[data-cy=sync]').click();
    cy.get('#view').should('not.have.class', 'outOfSync');
    cy.get('#autoSync').check();
    typeInEditor('ing');
    cy.get('#view').should('not.have.class', 'outOfSync');
    cy.getLocalStorage('codeStore').snapshot();
  });

  it('should automatically defer rendering when complex diagrams are edited', () => {
    cy.get('#view').should('not.have.class', 'outOfSync');
    typeInEditor(`
A & B & C & D & E --> F & G & K & Z & i
A & B & C & D & E --> F & G & K & Z & i
A & B & C & D & E --> F & G & K & Z & i
A & B & C & D & E --> F & G & K & Z & i
A & B & C & D & E --> F & G & K & Z & i
A & B & C & D & E --> F & G & K & Z & i
A & B & C & D & E --> F & G & K & Z & i
A & B & C & D & E --> F & G & K & Z & i
A & B & C & D & E --> F & G & K & Z & i`);
    cy.get('#view').should('have.class', 'outOfSync');
    cy.get('#errorContainer').should('contain.text', 'It will be updated automatically.');
    // The class should be removed automatically after 1 second.
    cy.get('#view').should('not.have.class', 'outOfSync');
  });

  it('supports commenting code out/in', () => {
    cy.get('#editor').contains('Car').click();
    cy.get('#editor').get('textarea').type(`${cmd}/`, { force: true });
    cy.get('#view').contains('Car').should('not.exist');

    typeInEditor(`{uparrow}${cmd}/`);
    cy.get('#view').contains('Car').should('exist');
  });

  it('supports editing code when code is incorrect', () => {
    cy.visit(
      '/edit#pako:eNpljjEKwzAMRa8SNOcEnlt6gK5eVFvYJsgOqkwpIXevg9smEE1PnyfxF3DFExgISW-CczQ2D21cYU7a-SGYXRwyvTp9jUhuKlVP-eHy7zA-leQsMEmg_QOM0BLG5FujZVMsaCQmC6ahR5ks2Lw2r84ela4-aREwKpVGwKrl_s7ut3fnkjAIcg_XDzuaUhs'
    );
    cy.get('#errorContainer').should('not.exist');
    typeInEditor(`branch test`, { bottom: true, newline: true });
    cy.get('#editor').contains('branch test').should('exist');
    cy.get('#errorContainer')
      .contains(
        'Error: Trying to checkout branch which is not yet created. (Help try using "branch master")'
      )
      .should('exist');
  });

  it('should update diagram after entire text is removed', () => {
    // https://github.com/mermaid-js/mermaid-live-editor/issues/1102
    typeInEditor(`${cmd} a {backspace}`);
    typeInEditor('graph LR');
    typeInEditor(' {enter}  A-->Car');
    cy.get('#view').contains('Car').should('exist');
  });
});

describe('Pan and Zoom', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });
  it('should toggle pan and zoom', () => {
    cy.get('#svg-pan-zoom-reset-pan-zoom').should('not.exist');
    cy.contains('Pan & Zoom').click();
    cy.get('#svg-pan-zoom-reset-pan-zoom').should('exist');
    cy.contains('Pan & Zoom').click();
    cy.get('#svg-pan-zoom-reset-pan-zoom').should('not.exist');
  });
});
