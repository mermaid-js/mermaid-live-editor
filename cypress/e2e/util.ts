export const cmd = `{${Cypress.platform === 'darwin' ? 'meta' : 'ctrl'}}`;

export const getEditor = ({ bottom = true, newline = false } = {}) =>
	cy
		.get('#editor textarea:first')
		.click()
		.focused()
		.type(`${bottom ? '{pageDown}' : cmd}`)
		.type(`${newline ? '{enter}' : cmd}`);

const downloadsFolder = Cypress.config('downloadsFolder');

export const verifyFileSize = (
	fileType: 'history' | 'diagram',
	extension: string,
	size: number
) => {
	const fileName = `mermaid-${fileType}-2022-01-01-000000.${extension}`;
	const filePath = `${downloadsFolder}/${fileName}`;
	cy.verifyDownload(fileName);
	cy.readFile(filePath, null, {
		log: false
	}).then((buffer) => expect((buffer as ArrayBuffer).byteLength).to.be.gt(size));
	cy.task('deleteFile', filePath);
};

export const verifyFileSnapshot = (
	fileType: 'history' | 'diagram',
	extension: string,
	content: string
) => {
	const fileName = `mermaid-${fileType}-2022-01-01-000000.${extension}`;
	const filePath = `${downloadsFolder}/${fileName}`;
	cy.verifyDownload(fileName);
	cy.readFile(filePath, null, {
		log: false
	}).then((buffer) =>
		expect(new TextDecoder('utf-8').decode(buffer as ArrayBuffer)).to.contain(content)
	);
	cy.task('deleteFile', filePath);
};
