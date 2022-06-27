describe('Check actions', () => {
	beforeEach(() => {
		cy.clearLocalStorage();
		cy.visit('/edit');
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

	it('should load gists from URL', () => {
		cy.get('#gist').type('https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a');
		cy.contains('Load Gist').click();
		cy.contains('Go shopping!!');
	});

	it('should download png and svg', () => {
		const now = new Date(2022, 0, 1).getTime();
		cy.clock(now);
		const downloadsFolder = Cypress.config('downloadsFolder');

		const verifyFileSize = (fileType: string, size: number) => {
			cy.get(`#download${fileType.toUpperCase()}`).click();
			const fileName = `mermaid-diagram-2022-01-01-000000.${fileType}`;
			const filePath = `${downloadsFolder}/${fileName}`;
			cy.verifyDownload(fileName);
			cy.readFile(filePath, null, {
				log: false
			}).then((buffer) => expect((buffer as ArrayBuffer).byteLength).to.be.gt(size));
			cy.task('deleteFile', filePath);
		};

		verifyFileSize('png', 21_000);
		verifyFileSize('svg', 11_000);

		// Verify downloaded file is different for different diagrams
		cy.contains('Sample Diagrams').click();
		cy.contains('ER Diagram').click();

		verifyFileSize('png', 46_000);
		verifyFileSize('svg', 12_000);

		cy.clock().invoke('restore');
	});
});
