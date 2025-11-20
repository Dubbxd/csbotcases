import express, { Express } from 'express';
import logger from '../bot/utils/logger';
import healthRouter from './routes/health';
import votesRouter from './routes/votes';
import imageProxyRouter from './routes/imageProxy';

export async function startAPIServer(port: number): Promise<Express> {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  // Routes
  app.use('/health', healthRouter);
  app.use('/webhooks/votes', votesRouter);
  app.use('/api/image-proxy', imageProxyRouter);

  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    logger.error('API Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Start server
  app.listen(port, () => {
    logger.info(`API server listening on port ${port}`);
  });

  return app;
}
