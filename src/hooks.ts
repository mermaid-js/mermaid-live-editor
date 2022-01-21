import type { Handle } from '@sveltejs/kit/types/hooks';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		ssr: false
	});

	return response;
};
