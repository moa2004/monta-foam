import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const allowedOrigin = new URL(env.CLIENT_URL).origin;

/**
 * CORS controls which browser may read a response, but it does not by itself
 * stop a cross-origin form or fetch from reaching a state-changing handler.
 * Reject unexpected browser origins before auth cookies can be used.
 */
export const requireTrustedOrigin = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.headers.origin;
  if (origin && origin !== allowedOrigin) {
    return next(AppError.forbidden('Request origin is not allowed', 'INVALID_ORIGIN'));
  }

  next();
};
