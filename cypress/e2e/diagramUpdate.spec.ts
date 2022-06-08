describe('Auto sync tests', () => {
	beforeEach(() => {
		cy.clearLocalStorage();
		cy.visit('/');
	});
	it('should dim diagram when code is edited', () => {
		cy.contains('Auto sync').click();
		cy.get('#view').should('not.have.class', 'outOfSync');
		cy.get('#editor').type('  C --> Test');
		cy.get('#view').should('have.class', 'outOfSync');
		cy.getLocalStorage('codeStore').snapshot();
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
		cy.get('#editor').type('  C --> Test');
		cy.get('#view').should('have.class', 'outOfSync');
		cy.get('[data-cy=sync]').click();
		cy.get('#view').should('not.have.class', 'outOfSync');
		cy.get('#autoSync').check();
		cy.get('#editor').type('ing');
		cy.get('#view').should('not.have.class', 'outOfSync');
		cy.getLocalStorage('codeStore').snapshot();
	});

	it('supports commenting code out/in', () => {
		const cmd = Cypress.platform === 'darwin' ? 'meta' : 'ctrl';

		cy.get('#editor').type(`{uparrow}{${cmd}}/`);
		cy.get('#view').contains('Car').should('not.exist');

		cy.get('#editor').type(`{uparrow}{${cmd}}/`);
		cy.get('#view').contains('Car').should('exist');
	});
});
