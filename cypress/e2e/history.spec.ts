import { typeInEditor, verifyFileSnapshot } from './util';

describe('Save History', () => {
  beforeEach(() => {
    cy.clock(new Date(2022, 0, 1).getTime());
    cy.clearLocalStorage();
    cy.visit('/edit');
    cy.on('uncaught:exception', (error) => {
      // Skip the error from inside monaco.
      return !error.message.includes('duration');
    });
    cy.contains('History').click();
  });

  afterEach(() => {
    cy.clock().invoke('restore');
  });

  it('should load history from localstorage', () => {
    cy.setLocalStorage(
      'manualHistoryStore',
      '[{"state":{"code":"graph TD\\n    A[Halloween] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":false},"time":0,"type":"manual","id":"d7ea820e-21dd-418a-b984-fd58acde09df","name":"hollow-art"},{"state":{"code":"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":true},"time":0,"type":"manual","id":"b749ffc6-522b-4a44-86cf-7c1ffc3146b3","name":"helpful-ocean"}]'
    );
    cy.setLocalStorage(
      'autoHistoryStore',
      '[{"state":{"code":"graph TD\\n    A[New Year] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":false},"time":0,"type":"auto","id":"69ea820e-522b-4a44-86cf-fd58acde09df","name":"barking-dog"},{"state":{"code":"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)","mermaid":"{\\n  \\"theme\\": \\"dark\\"\\n}","autoSync":true,"updateDiagram":true},"time":0,"type":"manual","id":"x749ffc6-21dd-418a-b984-7c1ffc3146b3","name":"needy-mosquito"}]'
    );
    cy.reload();
    cy.contains('History').click();
    cy.get('#historyList').find('li').should('have.length', 2);
    cy.get('#historyList').find('No items in History').should('not.exist');
    cy.get('#historyList').contains('helpful-ocean');
    cy.get('#historyList').contains('hollow-art');
    cy.contains('Restore').click();
    cy.contains('Halloween');
    cy.contains('Timeline').click();

    cy.get('#historyList').find('li').should('have.length', 2);
    cy.get('#historyList').find('No items in History').should('not.exist');
    cy.get('#historyList').contains('needy-mosquito');
    cy.get('#historyList').contains('barking-dog');
    cy.contains('Restore').click();
    cy.contains('New Year');
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
    typeInEditor('  C --> HistoryTest');
    cy.get('#saveHistory').click();
    cy.get('#historyList').find('li').should('have.length', 2);
  });

  it('should be able to restore and delete', () => {
    cy.get('#saveHistory').click();
    typeInEditor('  C --> HistoryTest');
    cy.get('#historyList').find('No items in History').should('not.exist');
    cy.get('#historyList').find('li').should('have.length', 1);
    cy.contains('HistoryTest');
    cy.contains('Restore').click();
    cy.contains('HistoryTest').should('not.exist');
    cy.contains('Delete').click();
    cy.get('#historyList').find('li').should('have.length', 0);
    cy.get('#historyList').contains('No items in History');
    cy.get('#saveHistory').click();
    typeInEditor('  C --> HistoryTest');
    cy.get('#saveHistory').click();
    cy.get('#editor').type('ing');
    cy.get('#clearHistory').click();
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Clear all saved items?');
    });
    cy.on('window:confirm', () => true);
    cy.get('#historyList').contains('No items in History');
  });

  // TODO: Fix #639
  xit('should auto save history', () => {
    typeInEditor('  C --> HistoryTest');
    cy.tick(70_000);
    cy.contains('Timeline').click();
    cy.get('#historyList').find('li').should('have.length', 1);
    cy.get('#editor').type('ing');
    cy.tick(70_000);
    cy.get('#historyList').find('li').should('have.length', 2);
    for (let i = 0; i < 31; i++) {
      cy.get('#editor').type('.');
      cy.tick(70_000);
    }
    cy.get('#historyList').find('li').should('have.length', 30);
  });

  it('should download history', () => {
    cy.get('#saveHistory').click();
    cy.get(`#downloadHistory`).click();
    verifyFileSnapshot('history', 'json', 'A[Christmas] -->|Get money| B(Go shopping)');
  });
});
