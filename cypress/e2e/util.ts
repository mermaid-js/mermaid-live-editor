export const cmd = `{${Cypress.platform === 'darwin' ? 'meta' : 'ctrl'}}`;
const editor = () => cy.get('#editor textarea:first');

interface EditorOptions {
  bottom?: boolean;
  newline?: boolean;
}

export const typeInEditor = (
  text: string,
  { bottom = true, newline = false }: EditorOptions = {}
) => {
  if (bottom) {
    editor().type('{pageDown}');
  }
  if (newline) {
    editor().type('{enter}');
  }
  editor().type(text);
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
