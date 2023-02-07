import { verifyFileSizeGreaterThan } from './util';
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
    cy.clock(new Date(2022, 0, 1).getTime());

    cy.get(`#downloadPNG`).click();
    verifyFileSizeGreaterThan('diagram', 'png', 21_000);

    cy.get(`#downloadSVG`).click();
    verifyFileSizeGreaterThan('diagram', 'svg', 10_000);

    // Verify downloaded file is different for different diagrams
    cy.contains('Sample Diagrams').click();
    cy.contains('ER').click();

    cy.get(`#downloadPNG`).click();
    verifyFileSizeGreaterThan('diagram', 'png', 46_000);

    cy.get(`#downloadSVG`).click();
    verifyFileSizeGreaterThan('diagram', 'svg', 11_000);

    cy.clock().invoke('restore');
  });
});
