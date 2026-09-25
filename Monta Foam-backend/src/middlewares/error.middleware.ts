import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(AppError.notFound(`Route ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
};

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code: string | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors gracefully without leaking internals
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = 'A record with this value already exists';
        code = 'UNIQUE_CONSTRAINT_VIOLATION';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        code = 'RECORD_NOT_FOUND';
        break;
      default:
        statusCode = 400;
        message = 'Database request error';
        code = 'DB_ERROR';
    }
  }

  // Log full error details server-side (never expose stack traces to clients)
  logger.error(message, {
    statusCode,
    code,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
    isOperational: err instanceof AppError ? err.isOperational : false,
  });

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(env.NODE_ENV === 'development' && !(err instanceof AppError) ? { stack: err.stack } : {}),
  });
};
