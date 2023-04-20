import { toBase64 } from 'js-base64';

describe('Site Loads', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.url().should('include', '/edit#pako');
  });

  it('Check Home page load', () => {
    cy.url().should('include', '/edit');
    cy.contains('History').click();
    cy.getLocalStorage('codeStore').snapshot();
  });

  it('should keep code after reload', () => {
    cy.get('#editor').contains('Car');
    cy.reload();
    cy.get('#editor').contains('Car');
  });

  it('Check Redirect from old URL', () => {
    cy.visit(
      '/#/edit/eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW0NocmlzdG1hc10gLS0-fEdldCBtb25leXwgQihHbyBzaG9wcGluZylcbiAgICBCIC0tPiBDe0xldCBtZSB0aGlua31cbiAgICBDIC0tPnxPbmV8IERbTGFwdG9wXVxuICAgIEMgLS0-fFR3b3wgRVtpUGhvbmVdXG4gICAgQyAtLT58VGhyZWV8IEZbZmE6ZmEtY2FyIENhcl0iLCJtZXJtYWlkIjp7InRoZW1lIjoiZGVmYXVsdCJ9LCJ1cGRhdGVFZGl0b3IiOmZhbHNlfQ'
    );
    cy.url().should('include', '/edit#pako:eNp');
  });

  it('should load sample diagrams when clicked', () => {
    cy.contains('Sample Diagrams').click();
    cy.contains('Pie').click();
    cy.contains('pie title Pets adopted by volunteers');
    cy.contains('Class').click();
    cy.contains('classDiagram');
  });

  (Cypress.env('CI') === 'true' ? describe : describe.skip)('github', () => {
    it('should load diagram from gist', () => {
      cy.visit(`/edit?gist=https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a`);
      cy.contains('History').click();
      cy.contains('Go shopping!!');
      cy.contains('Revisions');
      cy.contains('sidharthv96 v8f8f1e2');
      cy.contains('sidharthv96 v7851e19');
      cy.getLocalStorage('codeStore').snapshot();
    });

    it('should load diagram from gist revision', () => {
      cy.visit(
        '/edit?gist=https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a/ec9b4ab0e41e4ff6287326cd3cb47affd7851e19'
      );
      cy.contains('History').click();
      cy.contains('Party');
      cy.contains('Revisions');
      cy.contains('sidharthv96 v7851e19');
      cy.getLocalStorage('codeStore').snapshot();
    });

    it('should load diagram from raw files', () => {
      cy.visit(
        '/edit?code=https://gist.githubusercontent.com/sidharthv96/6268a23e673a533dcb198f241fd7012a/raw/4eb03887e6a41397e80bdcdbf94017c498f8f1e2/code.mmd&config=https://gist.githubusercontent.com/sidharthv96/6268a23e673a533dcb198f241fd7012a/raw/4eb03887e6a41397e80bdcdbf94017c498f8f1e2/config.json'
      );
      cy.contains('Party');
      cy.getLocalStorage('codeStore').snapshot();
    });
  });

  // Disabled temporarily. Should be enabled after the issue is fixed in Mermaid.
  // it('should prevent setting the "securityLevel" option via URL', () => {
  // 	const b64State = toBase64(
  // 		`{"code":"graph TD\\nA[\\"<img src='https://via.placeholder.com/64' width=64 />\\"]","mermaid":"{\\"securityLevel\\": \\"loose\\", \\"theme\\": \\"forest\\"}","autoSync":true,"updateDiagram":true}`,
  // 		true
  // 	);
  // 	cy.on('window:confirm', () => true);
  // 	cy.visit(`/edit#${b64State}`);
  // 	cy.contains('Config').click();
  // 	cy.contains('forest');
  // 	cy.contains('securityLevel').should('not.exist');
  // 	cy.get('#view').find('img').should('not.exist');
  // 	cy.get('#view').contains('<img');
  // 	cy.get('#view').contains(`src='https://via.placeholder.com/64'`);
  // });

  it.skip('should allow persisting "securityLevel" using confirm dialogue', () => {
    const b64State = toBase64(
      `{"code":"graph TD\\nA[\\"<img src='https://dummyimage.com/64' width=64/>\\"]","mermaid":"{\\"securityLevel\\": \\"loose\\", \\"theme\\": \\"forest\\"}","autoSync":true,"updateDiagram":true}`,
      true
    );
    cy.on('window:confirm', () => false);
    cy.visit(`/edit#${b64State}`);
    cy.get('#editor').type(' ');
    cy.contains('Config').click();
    cy.contains('forest');
    cy.contains('securityLevel');
    cy.get('#view').find('img').should('be.visible');
  });

  it('should show troubleshooting steps if loading fails', () => {
    cy.visit('/#/edit/eyJjb2RlIjoiZ3JhcGggVERcbiAg');
    cy.reload(true);
    cy.contains('Please Click here to Raise an issue in github.');
  });
});

describe('Verify types of URLs', () => {
  it('should load compressed URL', () => {
    cy.visit(
      '/edit#pako:eNpVkM2KwkAQhF-l6dMK5gVyEDRxvYi7sF6WjIcm0zqDzg_jBJEk725Hd2G3Tw31VVFUj23QjCWeEkUD-1p5kFs2O77BN1M6QFEshg1ncMHzfYDV2ybA1YQYrT_NXvhqgqDqtxPGkI315_ElVU__h-cB6mZLMYd4-Kvsb2GAdWM_jcT_V0xicb03RyqPVLSUoJI-OEfHyZHV0rqfDAqzYccKS3k1pbNC5Ufhuqgp81rbHBJKxuXKc6Quh6-7b7HMqeNfqLYkC7gfanwAlW1ZvQ'
    );
    cy.contains('New Year');
    cy.visit(
      '/edit#pako:eNptkU1PwzAMhv9K5BOI9Q9EXBDbJA477YYqITcxndV8QD40weh_Jy1rGR0-OY_tV2_sEyivCSQogzGuGduAtnaixINji0bcf1WVWGfVXdMtx8M1faYm4B8sxR27JLClJd6nwK4VLTlN4bI4jMQd2pLe3C4KFhNNcLQ92jv9ADGLNoTdozc-zIV4ZDsNlud7RtVN7_5Sb_jYrFcN3iN_0pPbEqUZK3QbTP_Ojyv4NdR4bwTHlyMbPcOQ3WJ2CliBpWCRdbnLqFJDOpClGmRJNYauhtr1pS-_6bKMjebkA8hXNJFWgDn5_YdTIFPINDWdb3vu6r8BaWOZRQ'
    );
    cy.contains('Animal');
  });

  describe('Uncompressed URLs', () => {
    it('should load URL without specifier', () => {
      cy.visit(
        '/edit/#eyJjb2RlIjoiZ3JhcGhcbiAgICBUZXN0TGFiZWwiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGVmYXVsdFwiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ'
      );
      cy.contains('TestLabel');
      cy.visit(
        '/edit#eyJjb2RlIjoiY2xhc3NEaWFncmFtXG4gICAgQW5pbWFsIDx8LS0gRHVja1xuICAgIEFuaW1hbCA8fC0tIEZpc2hcbiAgICBBbmltYWwgPHwtLSBaZWJyYVxuICAgIEFuaW1hbCA6ICtpbnQgYWdlXG4gICAgQW5pbWFsIDogK1N0cmluZyBnZW5kZXJcbiAgICBBbmltYWw6ICtpc01hbW1hbCgpXG4gICAgQW5pbWFsOiArbWF0ZSgpXG4gICAgY2xhc3MgRHVja3tcbiAgICAgICtTdHJpbmcgYmVha0NvbG9yXG4gICAgICArc3dpbSgpXG4gICAgICArcXVhY2soKVxuICAgIH1cbiAgICBjbGFzcyBGaXNoe1xuICAgICAgLWludCBzaXplSW5GZWV0XG4gICAgICAtY2FuRWF0KClcbiAgICB9XG4gICAgY2xhc3MgWmVicmF7XG4gICAgICArYm9vbCBpc193aWxkXG4gICAgICArcnVuKClcbiAgICB9XG4gICAgICAgICAgICAiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGFya1wiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ'
      );
      cy.contains('Animal');
    });

    it('should load URL with "base64" specifier', () => {
      cy.visit(
        '/edit/#base64:eyJjb2RlIjoiZ3JhcGhcbiAgICBUZXN0TGFiZWwiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGVmYXVsdFwiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ'
      );
      cy.contains('TestLabel');
    });
  });
});
