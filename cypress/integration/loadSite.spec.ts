describe('Site Loads', () => {
	beforeEach(() => {
		cy.clearLocalStorage();
	});
	it('Check Home page load', () => {
		cy.visit('/');
		cy.url().should('include', '/edit');
		cy.contains('History').click();
		cy.getLocalStorage('codeStore').snapshot();
	});

	it('Check Redirect from old URL', () => {
		cy.visit(
			'/#/edit/eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW0NocmlzdG1hc10gLS0-fEdldCBtb25leXwgQihHbyBzaG9wcGluZylcbiAgICBCIC0tPiBDe0xldCBtZSB0aGlua31cbiAgICBDIC0tPnxPbmV8IERbTGFwdG9wXVxuICAgIEMgLS0-fFR3b3wgRVtpUGhvbmVdXG4gICAgQyAtLT58VGhyZWV8IEZbZmE6ZmEtY2FyIENhcl0iLCJtZXJtYWlkIjp7InRoZW1lIjoiZGVmYXVsdCJ9LCJ1cGRhdGVFZGl0b3IiOmZhbHNlfQ'
		);
		cy.url().should(
			'include',
			'/edit/eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW0NocmlzdG1hc10gLS0-fEdldCBtb25leXwgQihHbyBzaG9wcGluZylcbiAgICBCIC0tPiBDe0xldCBtZSB0aGlua31cbiAgICBDIC0tPnxPbmV8IERbTGFwdG9wXVxuICAgIEMgLS0-fFR3b3wgRVtpUGhvbmVdXG4gICAgQyAtLT58VGhyZWV8IEZbZmE6ZmEtY2FyIENhcl0iLCJtZXJtYWlkIjp7InRoZW1lIjoiZGVmYXVsdCJ9LCJ1cGRhdGVFZGl0b3IiOmZhbHNlfQ'
		);

		cy.contains('History').click();
		cy.getLocalStorage('codeStore').snapshot();
	});

	it('should load sample diagrams when clicked', () => {
		cy.contains('Sample Diagrams').click();
		cy.contains('Pie Chart').click();
		cy.contains('pie title Pets adopted by volunteers');
		cy.contains('Class Diagram').click();
		cy.contains('classDiagram');
	});

	it('should prevent setting the "securityLevel" option via URL', () => {
		const b64State = btoa(
			`{"code":"graph TD\\nA[\\"<img src='https://via.placeholder.com/64' width=64></img>\\"]","mermaid":"{\\"securityLevel\\": \\"loose\\", \\"theme\\": \\"forest\\"}","updateEditor":true,"autoSync":true,"updateDiagram":true}`
		);
		cy.visit(`/edit#${b64State}`);
		cy.contains('Config').click();
		cy.contains('forest').should('exist');
		cy.contains('securityLevel').should('not.exist');
	});
});
