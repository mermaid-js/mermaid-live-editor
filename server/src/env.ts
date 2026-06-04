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

  // Entra ID config is optional at the env level: it serves as the *bootstrap*
  // source so the first admin can sign in, but once an admin saves config via the
  // Integrations UI the DB row overrides these. See integrations/entraConfig.ts.
  ENTRA_TENANT_ID: z.string().min(1).optional(),
  ENTRA_CLIENT_ID: z.string().min(1).optional(),
  ENTRA_CLIENT_SECRET: z.string().min(1).optional(),
  ENTRA_REDIRECT_URI: z.string().url().optional(),

  // Comma-separated allowlist of admin emails. Admins may edit integration
  // settings. Env-only (never editable from the UI) so a bad saved config can
  // never strip admin rights.
  ADMIN_EMAILS: z.string().optional()
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

// Normalized (lowercased, trimmed) set of admin emails parsed from ADMIN_EMAILS.
const adminEmails = new Set(
  (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

export const isAdminEmail = (email: string | null | undefined): boolean =>
  email != null && adminEmails.has(email.trim().toLowerCase());
