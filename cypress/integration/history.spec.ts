describe('Save History', () => {
	beforeEach(() => {
		cy.clock();
		cy.clearLocalStorage();
		cy.visit('/edit');
		cy.contains('Actions').click();
		cy.contains('History').click();
	});

	it('should save when clicked', () => {
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
		cy.contains('Delete').click();
		cy.get('#historyList').find('li').should('have.length', 0);
		cy.get('#historyList').contains('No items in History');
		cy.get('#saveHistory').click();
		cy.get('#editor').type('  C --> HistoryTest');
		cy.get('#saveHistory').click();
		cy.get('#editor').type('ing');
		cy.get('#clearHistory').click();
		cy.on('window:alert', (str) => {
			expect(str).to.equal('Clear all saved items?');
		});
		cy.on('window:confirm', () => true);
		cy.get('#historyList').contains('No items in History');
	});

	it('should auto save history', () => {
		cy.get('#editor').type('  C --> HistoryTest');
		cy.tick(70000);
		cy.contains('Timeline').click();
		cy.get('#historyList').find('li').should('have.length', 1);
		cy.get('#editor').type('ing');
		cy.tick(70000);
		cy.get('#historyList').find('li').should('have.length', 2);
		for (let i = 0; i < 31; i++) {
			cy.get('#editor').type('.');
			cy.tick(70000);
		}
		cy.get('#historyList').find('li').should('have.length', 30);
	});
});
