import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

export const POST: RequestHandler = async ({ request }) => {
  if (!env.MERMAID_BEAUTY_SERVICE_URL) {
    return json({ message: 'GIF export service is not configured' }, { status: 503 });
  }

  const payload = await request.text();
  let upstreamResponse: Response;

  try {
    upstreamResponse = await globalThis.fetch(
      `${normalizeBaseUrl(env.MERMAID_BEAUTY_SERVICE_URL)}/v1/gif/render`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      }
    );
  } catch (error) {
    console.error('GIF upstream request failed', error);
    return json(
      {
        message: 'GIF export service is unreachable from the frontend server'
      },
      { status: 502 }
    );
  }

  const headers = new Headers();
  const contentDisposition = upstreamResponse.headers.get('content-disposition');
  const contentType = upstreamResponse.headers.get('content-type');

  if (contentDisposition) {
    headers.set('content-disposition', contentDisposition);
  }
  if (contentType) {
    headers.set('content-type', contentType);
  }

  return new Response(await upstreamResponse.arrayBuffer(), {
    status: upstreamResponse.status,
    headers
  });
};
