describe('Load sample diagrams', () => {
	beforeEach(() => {
		cy.clearLocalStorage();
		cy.visit('/edit');
	});
	it('should load new diagram clicked', () => {
		cy.contains('Sample Diagrams').click();
		cy.contains('Pie Chart').click();
		cy.contains('pie title Pets adopted by volunteers');
		cy.contains('Class Diagram').click();
		cy.contains('classDiagram');
	});
});
