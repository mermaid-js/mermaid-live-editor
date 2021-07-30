import { toBase64 } from 'js-base64';

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
		const b64State = toBase64(
			`{"code":"graph TD\\nA[\\"<img src='https://via.placeholder.com/64' width=64 />\\"]","mermaid":"{\\"securityLevel\\": \\"loose\\", \\"theme\\": \\"forest\\"}","updateEditor":true,"autoSync":true,"updateDiagram":true}`,
			true
		);
		cy.on('window:confirm', () => true);
		cy.visit(`/edit#${b64State}`);
		cy.contains('Config').click();
		cy.contains('forest');
		cy.contains('securityLevel').should('not.exist');
		cy.get('#view').find('img').should('not.exist');
		cy.get('#view').contains('<img');
		cy.get('#view').contains('src="https://via.placeholder.com/64"');
	});

	it('should allow persisting "securityLevel" using confirm dialogue', () => {
		const b64State = toBase64(
			`{"code":"graph TD\\nA[\\"<img src='https://via.placeholder.com/64' width=64/>\\"]","mermaid":"{\\"securityLevel\\": \\"loose\\", \\"theme\\": \\"forest\\"}","updateEditor":true,"autoSync":true,"updateDiagram":true}`,
			true
		);
		cy.on('window:confirm', () => false);
		cy.visit(`/edit#${b64State}`);
		cy.contains('Config').click();
		cy.contains('forest');
		cy.contains('securityLevel');
		cy.get('#view').find('img').should('be.visible');
	});
});
