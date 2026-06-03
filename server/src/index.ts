import cookieParser from 'cookie-parser';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { authRouter } from './auth/routes';
import { diagramsRouter } from './diagrams/routes';
import { env } from './env';
import { foldersRouter } from './folders/routes';
import { HttpError } from './http';
import { logger } from './logger';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/folders', foldersRouter);
  app.use('/api/diagrams', diagramsRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

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
