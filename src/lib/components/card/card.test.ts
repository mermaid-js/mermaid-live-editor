import { cleanup, render } from '@testing-library/svelte';
import { describe, expect, it, afterEach } from 'vitest';
import Card from './card.svelte';

describe('card.svelte', () => {
	// TODO: @testing-library/svelte claims to add this automatically but it doesn't work without explicit afterEach
	afterEach(() => cleanup());

	it('mounts', () => {
		const { container } = render(Card, {
			title: 'TabTest',
			tabs: [
				{ id: 't1', title: 'title1' },
				{ id: 't2', title: 'title2' }
			]
		});
		expect(container).toBeTruthy();
		expect(container).toHaveTextContent('TabTest');
		expect(container).toHaveTextContent('title1');
		expect(container).toHaveTextContent('title2');
		expect(container).not.toHaveTextContent('title3');
		expect(container.innerHTML).toMatchSnapshot();
	});
});
