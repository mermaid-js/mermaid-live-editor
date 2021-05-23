describe('Save History', () => {
	beforeEach(() => {
		cy.clearLocalStorage();
		cy.visit('/edit');
	});
	xit('should save when clicked', () => {
		cy.get('#historyList').find('li').should('have.length', 0);
		cy.get('#historyList').contains('No items in History');
		cy.get('#saveHistory').click();
		cy.get('#historyList').find('No items in History').should('not.exist');
		cy.get('#historyList').find('li').should('have.length', 1);
		cy.get('#saveHistory').click();
		cy.on('window:alert', (str) => {
			expect(str).to.equal('State already saved.');
		});
		cy.on('window:confirm', () => true);
		cy.get('#editor').type('  C --> HistoryTest');
		cy.get('#saveHistory').click();
		cy.get('#historyList').find('li').should('have.length', 2);
	});

	it('should be able to restore and delete', () => {
		cy.get('#saveHistory').click();
		cy.get('#editor').type('  C --> HistoryTest');
		cy.get('#historyList').find('No items in History').should('not.exist');
		cy.get('#historyList').find('li').should('have.length', 1);
		cy.contains('HistoryTest');
		cy.contains('Restore').click();
		cy.contains('HistoryTest').should('not.exist');
	});

	// it('Check Redirect from old URL', () => {
	// 	cy.visit(
	// 		'/#/edit/eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW0NocmlzdG1hc10gLS0-fEdldCBtb25leXwgQihHbyBzaG9wcGluZylcbiAgICBCIC0tPiBDe0xldCBtZSB0aGlua31cbiAgICBDIC0tPnxPbmV8IERbTGFwdG9wXVxuICAgIEMgLS0-fFR3b3wgRVtpUGhvbmVdXG4gICAgQyAtLT58VGhyZWV8IEZbZmE6ZmEtY2FyIENhcl0iLCJtZXJtYWlkIjp7InRoZW1lIjoiZGVmYXVsdCJ9LCJ1cGRhdGVFZGl0b3IiOmZhbHNlfQ'
	// 	);
	// 	cy.url().should(
	// 		'include',
	// 		'/edit/eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW0NocmlzdG1hc10gLS0-fEdldCBtb25leXwgQihHbyBzaG9wcGluZylcbiAgICBCIC0tPiBDe0xldCBtZSB0aGlua31cbiAgICBDIC0tPnxPbmV8IERbTGFwdG9wXVxuICAgIEMgLS0-fFR3b3wgRVtpUGhvbmVdXG4gICAgQyAtLT58VGhyZWV8IEZbZmE6ZmEtY2FyIENhcl0iLCJtZXJtYWlkIjp7InRoZW1lIjoiZGVmYXVsdCJ9LCJ1cGRhdGVFZGl0b3IiOmZhbHNlfQ'
	// 	);

	// 	cy.contains('History').click();
	// 	cy.wrap(localStorage).snapshot();
	// });
});
