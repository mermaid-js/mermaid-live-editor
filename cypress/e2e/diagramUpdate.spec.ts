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

	it('supports editing code when code is incorrect', () => {
		cy.visit(
			'/edit#pako:eNpljjEKwzAMRa8SNOcEnlt6gK5eVFvYJsgOqkwpIXevg9smEE1PnyfxF3DFExgISW-CczQ2D21cYU7a-SGYXRwyvTp9jUhuKlVP-eHy7zA-leQsMEmg_QOM0BLG5FujZVMsaCQmC6ahR5ks2Lw2r84ela4-aREwKpVGwKrl_s7ut3fnkjAIcg_XDzuaUhs'
		);
		cy.get('#errorContainer').should('not.exist');
		cy.get('#editor').type(`{enter}branch test`);
		cy.get('#editor').contains('branch test').should('exist');
		cy.get('#errorContainer')
			.contains(
				'Error: Trying to checkout branch which is not yet created. (Help try using "branch master")'
			)
			.should('exist');
	});
});
