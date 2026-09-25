import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

/**
 * Generic request validation middleware powered by Zod.
 * Validates body/query/params together and replaces req.body with the
 * parsed (and transformed, e.g. trimmed/lowercased) data.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(AppError.badRequest(messages, 'VALIDATION_ERROR'));
      }
      next(err);
    }
  };
};
