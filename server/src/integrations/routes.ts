import { Router, type Request, type Response } from 'express';
import { writeAudit } from '../audit';
import { requireAdmin } from '../auth/admin';
import { requireAuth, type AuthedRequest } from '../auth/middleware';
import { parse } from '../http';
import { entraConfigUpdateSchema } from '../validation';
import { getEntraConfig, saveEntraConfig } from './entraConfig';

export const integrationsRouter: Router = Router();

integrationsRouter.use(requireAuth);

const uid = (req: Request): string => (req as AuthedRequest).userId;

/** Masked view of the Entra config — never exposes the client secret. */
const maskedEntra = async (): Promise<{
  tenantId: string;
  clientId: string;
  redirectUri: string;
  clientSecretSet: boolean;
  source: 'db' | 'env' | null;
}> => {
  const config = await getEntraConfig();
  return {
    tenantId: config?.tenantId ?? '',
    clientId: config?.clientId ?? '',
    redirectUri: config?.redirectUri ?? '',
    clientSecretSet: Boolean(config?.clientSecret),
    source: config?.source ?? null
  };
};

integrationsRouter.get('/entra', requireAdmin, async (_req: Request, res: Response) => {
  res.json(await maskedEntra());
});

integrationsRouter.patch('/entra', requireAdmin, async (req: Request, res: Response) => {
  const input = parse(entraConfigUpdateSchema, req.body);

  await saveEntraConfig({
    tenantId: input.tenantId,
    clientId: input.clientId,
    redirectUri: input.redirectUri,
    clientSecret: input.clientSecret
  });

  await writeAudit(uid(req), 'integration.entra.update', {
    // Record which fields were set, never the values (esp. the secret).
    secretRotated: input.clientSecret !== undefined
  });

  res.json(await maskedEntra());
});
