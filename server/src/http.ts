import { z, type ZodType } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Validate `data` against `schema`, throwing a 400 HttpError on failure. */
export const parse = <T>(schema: ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'Validation failed', z.treeifyError(result.error));
  }
  return result.data;
};
