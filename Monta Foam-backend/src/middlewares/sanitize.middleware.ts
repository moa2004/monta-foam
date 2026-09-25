import { NextFunction, Request, Response } from 'express';
import { filterXSS } from 'xss';

/**
 * Recursively sanitizes all string values in an object to strip
 * potentially malicious HTML/JS (defense against stored/reflected XSS).
 */
const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return filterXSS(value, { whiteList: {} }); // strip all HTML tags
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = sanitizeValue(val);
    }
    return result;
  }
  return value;
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query) as typeof req.query;
  if (req.params) req.params = sanitizeValue(req.params) as typeof req.params;
  next();
};
