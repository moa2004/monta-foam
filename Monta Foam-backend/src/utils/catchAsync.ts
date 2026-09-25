import { NextFunction, Request, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps async route handlers so thrown/rejected errors are forwarded to
 * the global error handler via next(), avoiding repetitive try/catch blocks.
 */
export const catchAsync = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
