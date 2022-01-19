import type { Handle } from '@sveltejs/kit/types/hooks';

export const handle: Handle = async ({ request, resolve }) => {
	const response = await resolve(request, {
		ssr: false
	});

	return response;
};
