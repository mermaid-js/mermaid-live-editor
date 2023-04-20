export const cmd = `{${Cypress.platform === 'darwin' ? 'meta' : 'ctrl'}}`;

interface EditorOptions {
  bottom?: boolean;
  newline?: boolean;
}

export const typeInEditor = (
  text: string,
  { bottom = true, newline = false }: EditorOptions = {}
) => {
  cy.window().should('have.property', 'editorLoaded', true);
  cy.get('#editor').click();
  if (bottom) {
    cy.focused().type('{pageDown}');
  }
  if (newline) {
    cy.focused().type('{enter}');
  }
  cy.focused().type(text);
};

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
  }).then((buffer: ArrayBuffer) => {
    expect(buffer.byteLength).to.be.gt(size);
    expect(buffer.byteLength).to.be.lt(size * 1.3);
  });
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
