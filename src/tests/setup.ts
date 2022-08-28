import matchers from '@testing-library/jest-dom/matchers';
import { expect, beforeAll, vi } from 'vitest';

expect.extend(matchers);

// TODO: Remove once https://github.com/sveltejs/kit/issues/6259 is closed.
beforeAll(() => {
	vi.mock('$app/env', () => ({
		browser: 'window' in globalThis
	}));
});
