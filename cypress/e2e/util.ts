export const cmd = `{${Cypress.platform === 'darwin' ? 'meta' : 'ctrl'}}`;

export const getEditor = ({ bottom = true, newline = false } = {}) =>
  cy
    .get('#editor textarea:first')
    .click()
    .focused()
    .type(`${bottom ? '{pageDown}' : cmd}`)
    .type(`${newline ? '{enter}' : cmd}`);

const downloadsFolder = Cypress.config('downloadsFolder');

export const verifyFileSizeGreaterThan = (
  fileType: 'history' | 'diagram',
  extension: string,
  size: number
) => {
  const fileName = `mermaid-${fileType}-2022-01-01-000000.${extension}`;
  const filePath = `${downloadsFolder}/${fileName}`;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  cy.verifyDownload(fileName);
  cy.readFile(filePath, null, {
    log: false
  }).then((buffer: ArrayBuffer) => expect(buffer.byteLength).to.be.gt(size));
  cy.task('deleteFile', filePath);
};

export const verifyFileSnapshot = (
  fileType: 'history' | 'diagram',
  extension: string,
  content: string
) => {
  const fileName = `mermaid-${fileType}-2022-01-01-000000.${extension}`;
  const filePath = `${downloadsFolder}/${fileName}`;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  cy.verifyDownload(fileName);
  cy.readFile(filePath, null, {
    log: false
  }).then((buffer: ArrayBuffer) =>
    expect(new TextDecoder('utf8').decode(buffer)).to.contain(content)
  );
  cy.task('deleteFile', filePath);
};
