export const cmd = `{${Cypress.platform === 'darwin' ? 'meta' : 'ctrl'}}`;

export const getEditor = ({ bottom = true, newline = false } = {}) =>
	cy
		.get('#editor textarea:first')
		.click()
		.focused()
		.type(`${bottom ? '{pageDown}' : cmd}`)
		.type(`${newline ? '{enter}' : cmd}`);

export const disableDebounce = () => cy.setLocalStorage('noDebounce', 'true');
