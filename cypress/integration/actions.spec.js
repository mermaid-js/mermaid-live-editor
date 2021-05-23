describe('Check actions', () => {
	beforeEach(() => {
		cy.clearLocalStorage();
		cy.visit('/edit');
		cy.contains('Actions').click();
	});
	it('should update markdown code', () => {
		cy.get('#markdown')
			.invoke('val')
			.then((oldText) => {
				cy.get('#editor').click('bottom').type('{enter}C --> HistoryTest');
				cy.get('#markdown')
					.invoke('val')
					.then((newText) => {
						expect(oldText).to.not.eq(newText);
					});
			});
	});
});
