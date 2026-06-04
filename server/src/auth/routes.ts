import { Router, type Request, type Response } from 'express';
import { writeAudit } from '../audit';
import { prisma } from '../db';
import { env, isAdminEmail } from '../env';
import { getEntraConfig } from '../integrations/entraConfig';
import { logger } from '../logger';
import { buildAuthorizeUrl, createPkce, createState, exchangeCodeForClaims } from './entra';
import {
  OAUTH_TX_COOKIE,
  SESSION_COOKIE,
  clearCookieOptions,
  oauthTxCookieOptions,
  sessionCookieOptions,
  signOAuthTx,
  signSession,
  verifyOAuthTx
} from './jwt';
import { requireAuth, type AuthedRequest } from './middleware';

export const authRouter: Router = Router();

const postLoginUrl = (): string => `${env.APP_BASE_URL}${env.POST_LOGIN_PATH}`;

// Kick off the Entra ID PKCE flow.
authRouter.get('/login', async (_req: Request, res: Response) => {
  const config = await getEntraConfig();
  if (!config) {
    res.status(503).send('SSO is not configured.');
    return;
  }

  const { codeVerifier, codeChallenge } = createPkce();
  const state = createState();

  res.cookie(OAUTH_TX_COOKIE, signOAuthTx({ state, codeVerifier }), oauthTxCookieOptions());
  res.redirect(buildAuthorizeUrl({ state, codeChallenge, config }));
});

// Entra redirects back here with ?code & ?state.
authRouter.get('/callback', async (req: Request, res: Response) => {
  const { code, state, error, error_description: errorDescription } = req.query;

  if (typeof error === 'string') {
    logger.warn({ error, errorDescription }, 'Entra returned an auth error');
    res.status(400).send('Authentication failed.');
    return;
  }

  const txToken: unknown = (req.cookies as Record<string, unknown> | undefined)?.[OAUTH_TX_COOKIE];
  res.clearCookie(OAUTH_TX_COOKIE, clearCookieOptions());

  if (typeof code !== 'string' || typeof state !== 'string' || typeof txToken !== 'string') {
    res.status(400).send('Invalid authentication response.');
    return;
  }

  let tx;
  try {
    tx = verifyOAuthTx(txToken);
  } catch {
    res.status(400).send('Authentication session expired. Please try again.');
    return;
  }

  if (tx.state !== state) {
    res.status(400).send('Authentication state mismatch.');
    return;
  }

  try {
    const config = await getEntraConfig();
    if (!config) {
      res.status(503).send('SSO is not configured.');
      return;
    }

    const claims = await exchangeCodeForClaims({ code, codeVerifier: tx.codeVerifier, config });

    const user = await prisma.user.upsert({
      where: { entraOid: claims.oid },
      create: {
        entraOid: claims.oid,
        email: claims.email,
        displayName: claims.displayName
      },
      update: {
        email: claims.email,
        displayName: claims.displayName
      }
    });

    res.cookie(SESSION_COOKIE, signSession(user.id), sessionCookieOptions());
    await writeAudit(user.id, 'login');
    res.redirect(postLoginUrl());
  } catch (err) {
    logger.error({ err }, 'Auth callback failed');
    res.status(500).send('Authentication failed.');
  }
});

authRouter.post('/logout', requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  res.clearCookie(SESSION_COOKIE, clearCookieOptions());
  await writeAudit(userId, 'logout');
  res.status(204).end();
});

authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true }
  });
  if (!user) {
    res.clearCookie(SESSION_COOKIE, clearCookieOptions());
    res.status(401).json({ error: 'User not found' });
    return;
  }
  res.json({ ...user, isAdmin: isAdminEmail(user.email) });
});
