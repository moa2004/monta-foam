import winston from 'winston';
import { env } from './env';

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'cold-storage-api' },
  transports: [
    new winston.transports.Console({
      format:
        env.NODE_ENV === 'production'
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ level, message, timestamp, ...meta }) => {
                const rest = Object.keys(meta).length ? JSON.stringify(meta) : '';
                return `${timestamp} [${level}]: ${message} ${rest}`;
              }),
            ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
