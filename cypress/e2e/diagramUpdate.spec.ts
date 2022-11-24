import { getEditor, cmd } from './util';

describe('Auto sync tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should dim diagram when code is edited', () => {
    cy.contains('Auto sync').click();
    cy.get('#view').should('not.have.class', 'outOfSync');
    cy.get('#errorContainer').should('not.exist');
    getEditor({ bottom: true, newline: true }).type('  C --> Test');
    cy.get('#view').should('have.class', 'outOfSync');
    cy.get('#errorContainer').should('contain.text', 'Diagram out of sync.');
    cy.getLocalStorage('codeStore').snapshot();
  });

  it('should update diagram when shortcut is used', () => {
    cy.contains('Auto sync').click();
    cy.get('#view').should('not.have.class', 'outOfSync');
    getEditor().type('  C --> Test');
    cy.get('#view').should('have.class', 'outOfSync');
    cy.get('#errorContainer').should('contain.text', 'Diagram out of sync.');
    getEditor().type(`${cmd}{enter}`);
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
    getEditor().type('  C --> Test');
    cy.get('#view').should('have.class', 'outOfSync');
    cy.get('[data-cy=sync]').click();
    cy.get('#view').should('not.have.class', 'outOfSync');
    cy.get('#autoSync').check();
    getEditor().type('ing');
    cy.get('#view').should('not.have.class', 'outOfSync');
    cy.getLocalStorage('codeStore').snapshot();
  });

  it('supports commenting code out/in', () => {
    getEditor().type(`{uparrow}${cmd}/`);
    cy.get('#view').contains('Car').should('not.exist');

    getEditor().type(`{uparrow}${cmd}/`);
    cy.get('#view').contains('Car').should('exist');
  });

  it('supports editing code when code is incorrect', () => {
    cy.visit(
      '/edit#pako:eNpljjEKwzAMRa8SNOcEnlt6gK5eVFvYJsgOqkwpIXevg9smEE1PnyfxF3DFExgISW-CczQ2D21cYU7a-SGYXRwyvTp9jUhuKlVP-eHy7zA-leQsMEmg_QOM0BLG5FujZVMsaCQmC6ahR5ks2Lw2r84ela4-aREwKpVGwKrl_s7ut3fnkjAIcg_XDzuaUhs'
    );
    cy.get('#errorContainer').should('not.exist');
    getEditor({ newline: true }).type(`branch test`);
    cy.get('#editor').contains('branch test').should('exist');
    cy.get('#errorContainer')
      .contains(
        'Error: Trying to checkout branch which is not yet created. (Help try using "branch master")'
      )
      .should('exist');
  });

  it('should update diagram after entire text is removed', () => {
    // https://github.com/mermaid-js/mermaid-live-editor/issues/1102
    getEditor().type(`${cmd} a {backspace}`);
    getEditor().type('graph LR');
    getEditor().type(' {enter}  A-->Car');
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
