import cookieParser from 'cookie-parser';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pinoHttp } from 'pino-http';
import { authRouter } from './auth/routes';
import { diagramsRouter } from './diagrams/routes';
import { env } from './env';
import { foldersRouter } from './folders/routes';
import { HttpError } from './http';
import { integrationsRouter } from './integrations/routes';
import { logger } from './logger';

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultFrontendDir = path.resolve(here, '../../docs');

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', true);
  // CSP / COEP off: we also serve the editor (Monaco web workers, inline styles)
  // and TLS is terminated by the upstream reverse proxy.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/folders', foldersRouter);
  app.use('/api/diagrams', diagramsRouter);
  app.use('/api/integrations', integrationsRouter);

  // Unmatched API routes → JSON 404 (don't fall through to the static editor).
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  if (env.SERVE_FRONTEND) {
    const frontendDir = env.FRONTEND_DIR ?? defaultFrontendDir;
    logger.info(`Serving static editor from ${frontendDir}`);
    // `extensions: ['html']` lets /edit resolve to edit.html (prerendered pages).
    app.use(express.static(frontendDir, { extensions: ['html'] }));
    app.use((_req: Request, res: Response) => {
      res.status(404).sendFile(path.join(frontendDir, '404.html'));
    });
  } else {
    app.use((_req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  // Central error handler. Express 5 forwards rejected promises here.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message, details: err.details });
      return;
    }
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};

// Only start listening when run directly (not when imported by tests).
if (process.env.VITEST === undefined) {
  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`Mermaid editor API listening on http://localhost:${env.PORT}`);
  });
}
