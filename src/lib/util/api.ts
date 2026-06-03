// Thin fetch wrapper for the backend API. Same origin (the editor is served
// behind a reverse proxy that forwards /api to the Express service), so we just
// send the session cookie with `credentials: 'include'`.

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    ...init
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : undefined) ?? response.statusText;
    throw new ApiError(response.status, message, data);
  }

  return data as T;
};

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

export const api = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body: unknown): Promise<T> => request<T>(path, jsonInit('POST', body)),
  patch: <T>(path: string, body: unknown): Promise<T> => request<T>(path, jsonInit('PATCH', body)),
  delete: (path: string): Promise<void> =>
    request<undefined>(path, { method: 'DELETE' }).then(() => undefined)
};
