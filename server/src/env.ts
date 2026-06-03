import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8787),
  APP_BASE_URL: z.string().url(),
  POST_LOGIN_PATH: z.string().startsWith('/').default('/edit'),

  // When true, the API process also serves the built static editor (single port
  // behind a reverse proxy). FRONTEND_DIR defaults to ../docs relative to server/.
  SERVE_FRONTEND: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  FRONTEND_DIR: z.string().optional(),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(16),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(3600),

  ENTRA_TENANT_ID: z.string().min(1),
  ENTRA_CLIENT_ID: z.string().min(1),
  ENTRA_CLIENT_SECRET: z.string().min(1),
  ENTRA_REDIRECT_URI: z.string().url()
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  console.error(z.treeifyError(parsed.error));
  throw new Error('Invalid environment configuration. See server/.env.example.');
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
