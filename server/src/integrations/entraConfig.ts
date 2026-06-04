import { Prisma } from '@prisma/client';
import crypto from 'node:crypto';
import { prisma } from '../db';
import { env } from '../env';
import { logger } from '../logger';

// The DB key under which the Entra integration config is stored in AppSetting.
export const ENTRA_SETTING_KEY = 'entra';

// Shape persisted in AppSetting.value. The client secret is stored encrypted.
interface StoredEntraConfig {
  tenantId: string;
  clientId: string;
  clientSecretEnc: string;
  redirectUri: string;
}

export interface EntraEffectiveConfig {
  tenantId: string;
  clientId: string;
  /** Decrypted client secret — server-only, never sent to the frontend. */
  clientSecret: string;
  redirectUri: string;
  source: 'db' | 'env';
}

// --- Secret encryption (AES-256-GCM) -------------------------------------
// The key is derived from JWT_SECRET so no new secret/env var is required.
// Stored format: base64(iv):base64(authTag):base64(ciphertext).

const secretKey = crypto.scryptSync(env.JWT_SECRET, 'mle-entra-secret', 32);

export const encryptSecret = (plaintext: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(
    ':'
  );
};

const decryptSecret = (encoded: string): string => {
  const [ivB64, tagB64, dataB64] = encoded.split(':');
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Malformed encrypted secret');
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final()
  ]).toString('utf8');
};

// --- Effective-config provider -------------------------------------------
// Per-process in-memory cache. Invalidated on write within this process; a
// multi-instance deployment would be stale until its own write/restart, which
// is acceptable for the single-instance self-hosted target.

let cached: EntraEffectiveConfig | null | undefined;

const envConfig = (): EntraEffectiveConfig | null => {
  if (
    env.ENTRA_TENANT_ID &&
    env.ENTRA_CLIENT_ID &&
    env.ENTRA_CLIENT_SECRET &&
    env.ENTRA_REDIRECT_URI
  ) {
    return {
      tenantId: env.ENTRA_TENANT_ID,
      clientId: env.ENTRA_CLIENT_ID,
      clientSecret: env.ENTRA_CLIENT_SECRET,
      redirectUri: env.ENTRA_REDIRECT_URI,
      source: 'env'
    };
  }
  return null;
};

/**
 * Resolve the effective Entra config: the saved DB config if present, otherwise
 * the env bootstrap fallback, otherwise null (SSO not configured). Cached.
 */
export const getEntraConfig = async (): Promise<EntraEffectiveConfig | null> => {
  if (cached !== undefined) {
    return cached;
  }

  const row = await prisma.appSetting.findUnique({ where: { key: ENTRA_SETTING_KEY } });
  if (row) {
    const stored = row.value as unknown as StoredEntraConfig;
    try {
      cached = {
        tenantId: stored.tenantId,
        clientId: stored.clientId,
        clientSecret: decryptSecret(stored.clientSecretEnc),
        redirectUri: stored.redirectUri,
        source: 'db'
      };
      return cached;
    } catch (error) {
      // e.g. JWT_SECRET was rotated and the stored secret can't be decrypted.
      // Fall back to env so login keeps working, and warn loudly.
      logger.warn(
        { error },
        'Failed to decrypt stored Entra client secret; falling back to env config'
      );
    }
  }

  cached = envConfig();
  return cached;
};

/** Drop the cached config so the next getEntraConfig() re-reads from the DB. */
export const invalidateEntraConfig = (): void => {
  cached = undefined;
};

/**
 * Read the current raw stored config (DB only), used by the update endpoint to
 * decide whether to keep the existing encrypted secret. Returns null if none.
 */
export const getStoredEntraConfig = async (): Promise<StoredEntraConfig | null> => {
  const row = await prisma.appSetting.findUnique({ where: { key: ENTRA_SETTING_KEY } });
  return row ? (row.value as unknown as StoredEntraConfig) : null;
};

/**
 * Upsert the Entra config. If `clientSecret` is provided it is encrypted and
 * stored; otherwise the existing encrypted secret is preserved. Invalidates the
 * cache. Returns the effective config after the write.
 */
export const saveEntraConfig = async (input: {
  tenantId: string;
  clientId: string;
  redirectUri: string;
  clientSecret?: string;
}): Promise<EntraEffectiveConfig> => {
  const existing = await getStoredEntraConfig();
  const clientSecretEnc = input.clientSecret
    ? encryptSecret(input.clientSecret)
    : existing?.clientSecretEnc;

  if (!clientSecretEnc) {
    throw new Error('A client secret is required when none has been saved yet');
  }

  const value: StoredEntraConfig = {
    tenantId: input.tenantId,
    clientId: input.clientId,
    clientSecretEnc,
    redirectUri: input.redirectUri
  };

  const jsonValue = value as unknown as Prisma.InputJsonValue;
  await prisma.appSetting.upsert({
    where: { key: ENTRA_SETTING_KEY },
    create: { key: ENTRA_SETTING_KEY, value: jsonValue },
    update: { value: jsonValue }
  });

  invalidateEntraConfig();
  return {
    tenantId: value.tenantId,
    clientId: value.clientId,
    clientSecret: decryptSecret(value.clientSecretEnc),
    redirectUri: value.redirectUri,
    source: 'db'
  };
};
