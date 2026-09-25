import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { logger } from './config/logger';
import routes from './routes';
import { sanitizeInput } from './middlewares/sanitize.middleware';
import { apiLimiter } from './middlewares/rateLimiter.middleware';
import { requireTrustedOrigin } from './middlewares/origin.middleware';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // Trust proxy (needed for correct req.ip behind Railway/VPS reverse proxies)
  app.set('trust proxy', 1);

  // ─── Security headers ──────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // ─── CORS ───────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    }),
  );
  app.use(requireTrustedOrigin);

  // ─── Body parsing ───────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' })); // limits payload size (DoS mitigation)
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // ─── Prevent HTTP Parameter Pollution ───────────────────────────────────
  app.use(hpp());

  // ─── Sanitize all input against XSS ─────────────────────────────────────
  app.use(sanitizeInput);

  // ─── Logging ────────────────────────────────────────────────────────────
  app.use(
    morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      stream: { write: (msg: string) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) },
    }),
  );

  // ─── Global rate limiting ───────────────────────────────────────────────
  app.use('/api', apiLimiter);

  // ─── API Routes ─────────────────────────────────────────────────────────
  app.use('/api/v1', routes);

  // ─── Swagger Docs ───────────────────────────────────────────────────────
  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // ─── Root ───────────────────────────────────────────────────────────────
  app.get('/', (_req, res) => {
    res.json({ success: true, message: 'Monta Foam API is running 🧊' });
  });

  // ─── 404 + Error handling ───────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
