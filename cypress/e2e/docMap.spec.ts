describe('Editor docs tests', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      return false;
    });
    cy.clearLocalStorage();
    cy.visit('/edit');
    cy.contains('Sample Diagrams').click();
  });

  it('Test default loading', () => {
    cy.get(`[data-cy=docs][href^="https://mermaid.js.org/"]`).should('exist');
  });

  it('Test to see if the correct URL loads when changing from one diagram to other', () => {
    cy.contains('Flow').click();
    cy.get(`[data-cy=docs][href$="/syntax/flowchart.html"]`).should('exist');

    cy.contains('Config').click();
    cy.get(`[data-cy=docs][href$="/syntax/flowchart.html#configuration"]`).should('exist');

    cy.contains('Sequence').click();
    cy.get(`[data-cy=docs][href$="/syntax/sequenceDiagram.html#configuration"]`).should('exist');

    cy.contains('Code').click();
    cy.get(`[data-cy=docs][href$="/syntax/sequenceDiagram.html"]`).should('exist');
  });

  it("Test to check URLs for a case where config URL doesn't exist", () => {
    cy.contains('State').click();
    cy.get(`[data-cy=docs][href$="/syntax/stateDiagram.html"]`).should('exist');

    cy.contains('Config').click();
    cy.get(`[data-cy=docs][href$="/syntax/stateDiagram.html"]`).should('exist');
  });
});
