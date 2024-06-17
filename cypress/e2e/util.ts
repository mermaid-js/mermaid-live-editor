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
  cy.get('#editor').within(() => {
    if (bottom) {
      cy.get('textarea').type('{pageDown}');
    }
    if (newline) {
      cy.get('textarea').type('{enter}');
    }
    cy.get('textarea').type(text);
  });
};

const downloadsFolder = Cypress.config('downloadsFolder');

export const verifyFileSizeGreaterThan = (
  fileType: 'history' | 'diagram',
  extension: string,
  size: number
) => {
  cy.get('#view').should('not.have.class', 'outOfSync');
  cy.task('readAndDeleteFile', {
    folder: downloadsFolder,
    fileNamePattern: `^mermaid-${fileType}-.*.${extension}$`,
    mode: 'size'
  }).then((fileSize: number) => {
    expect(fileSize).to.be.gt(size);
    expect(fileSize).to.be.lt(size * 1.3);
  });
};

export const verifyFileSnapshot = (
  fileType: 'history' | 'diagram',
  extension: string,
  content: string
) => {
  cy.task('readAndDeleteFile', {
    folder: downloadsFolder,
    fileNamePattern: `^mermaid-${fileType}-.*.${extension}$`,
    mode: 'content'
  }).then((fileContent: number) => {
    expect(fileContent).to.contain(content);
  });
};
