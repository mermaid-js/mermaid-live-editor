import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import Card from './Card.svelte';

describe('card.svelte', () => {
  // TODO: @testing-library/svelte claims to add this automatically but it doesn't work without explicit afterEach
  afterEach(() => cleanup());

  it('mounts', () => {
    const { container } = render(Card, {
      title: 'TabTest',
      tabs: [
        { id: 't1', title: 'title1', icon: 'fab fa-git-alt' },
        { id: 't2', title: 'title2', icon: 'far fa-bookmark' }
      ]
    });
    expect(container).toBeTruthy();
    expect(container).toHaveTextContent('TabTest');
    expect(container).toHaveTextContent('title1');
    expect(container).toHaveTextContent('title2');
    expect(container).not.toHaveTextContent('title3');
  });
});
