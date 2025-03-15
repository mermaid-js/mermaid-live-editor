import { typeInEditor, verifyFileSizeGreaterThan } from './util';
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
        typeInEditor('C --> HistoryTest', { bottom: true, newline: true });
        cy.get('#markdown')
          .invoke('val')
          .then((newText) => {
            expect(oldText).to.not.eq(newText);
          });
      });
  });

  it.skip('should load gists from URL', () => {
    cy.get('#gist').type('https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a');
    cy.contains('Load Gist').click();
    cy.contains('Go shopping!!');
  });

  it('should download png and svg', () => {
    cy.get(`#downloadPNG`).click();
    verifyFileSizeGreaterThan('diagram', 'png', 34_000);

    cy.get(`#downloadSVG`).click();
    verifyFileSizeGreaterThan('diagram', 'svg', 10_000);

    // Verify downloaded file is different for different diagrams
    cy.contains('Sample Diagrams').click();
    cy.contains('ER').click();

    cy.get(`#downloadPNG`).click();
    verifyFileSizeGreaterThan('diagram', 'png', 35_000);

    cy.get(`#downloadSVG`).click();
    verifyFileSizeGreaterThan('diagram', 'svg', 11_000);
  });
});
