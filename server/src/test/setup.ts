// Provide the minimum env so `env.ts` validates during unit tests.
// (Real values come from server/.env at runtime.)
process.env.NODE_ENV = 'test';
process.env.APP_BASE_URL ??= 'http://localhost:3000';
process.env.POST_LOGIN_PATH ??= '/edit';
process.env.DATABASE_URL ??= 'postgresql://localhost:5432/mermaid_editor_test';
process.env.JWT_SECRET ??= 'test-secret-that-is-sufficiently-long';
process.env.SESSION_TTL_SECONDS ??= '3600';
process.env.ENTRA_TENANT_ID ??= 'test-tenant';
process.env.ENTRA_CLIENT_ID ??= 'test-client';
process.env.ENTRA_CLIENT_SECRET ??= 'test-client-secret';
process.env.ENTRA_REDIRECT_URI ??= 'http://localhost:8787/api/auth/callback';
