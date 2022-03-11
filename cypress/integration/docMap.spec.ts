describe('Editor docs tests', () => {
	beforeEach(() => {
		cy.clearLocalStorage();
		cy.visit('/');
	});

	it('[Default] test', () => {
		cy.get(`[data-cy=docs][href^="https://mermaid-js.github.io/mermaid"]`).should('exist');
	});

	it('[Flow Chart] test', () => {
		cy.contains('Sample Diagrams').click();

		cy.contains('Flow Chart').click();
		cy.get(`[data-cy=docs][href$="/#/flowchart"]`).should('exist');

		cy.contains('Config').click();
		cy.get(`[data-cy=docs][href$="/#/flowchart?id=configuration"]`).should('exist');
	});

	it('[Sequence Diagram] test', () => {
		cy.contains('Sample Diagrams').click();

		cy.contains('Sequence Diagram').click();
		cy.get(`[data-cy=docs][href$="/#/sequenceDiagram"]`).should('exist');

		cy.contains('Config').click();
		cy.get(`[data-cy=docs][href$="/#/sequenceDiagram?id=configuration"]`).should('exist');
	});

	it('[Class Diagram] test', () => {
		cy.contains('Sample Diagrams').click();

		cy.contains('Class Diagram').click();
		cy.get(`[data-cy=docs][href$="/#/classDiagram"]`).should('exist');

		cy.contains('Config').click();
		cy.get(`[data-cy=docs][href$="/#/classDiagram?id=configuration"]`).should('exist');
	});

	it('[State Diagram] test', () => {
		cy.contains('Sample Diagrams').click();

		cy.contains('State Diagram').click();
		cy.get(`[data-cy=docs][href$="/#/stateDiagram"]`).should('exist');

		cy.contains('Config').click();
		cy.get(`[data-cy=docs][href$="/#/stateDiagram"]`).should('exist');
	});

	it('[Gantt Chart] test', () => {
		cy.contains('Sample Diagrams').click();

		cy.contains('Gantt Chart').click();
		cy.get(`[data-cy=docs][href$="/#/gantt"]`).should('exist');

		cy.contains('Config').click();
		cy.get(`[data-cy=docs][href$="/#/gantt?id=configuration"]`).should('exist');
	});

	it('[Pie Chart] test', () => {
		cy.contains('Sample Diagrams').click();

		cy.contains('Pie Chart').click();
		cy.get(`[data-cy=docs][href$="/#/pie"]`).should('exist');

		cy.contains('Config').click();
		cy.get(`[data-cy=docs][href$="/#/pie"]`).should('exist');
	});

	it('[ER Diagram] test', () => {
		cy.contains('Sample Diagrams').click();

		cy.contains('ER Diagram').click();
		cy.get(`[data-cy=docs][href$="/#/entityRelationshipDiagram"]`).should('exist');

		cy.contains('Config').click();
		cy.get(`[data-cy=docs][href$="/#/entityRelationshipDiagram?id=styling"]`).should('exist');
	});

	it('[User Journey] test', () => {
		cy.contains('Sample Diagrams').click();

		cy.contains('User Journey').click();
		cy.get(`[data-cy=docs][href$="/#/user-journey"]`).should('exist');

		cy.contains('Config').click();
		cy.get(`[data-cy=docs][href$="/#/user-journey"]`).should('exist');
	});
});
