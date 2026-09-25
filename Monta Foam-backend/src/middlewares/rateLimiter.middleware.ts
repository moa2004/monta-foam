import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * General API rate limiter - applied globally.
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Stricter limiter for authentication endpoints (login, register, OTP)
 * to mitigate brute-force and credential-stuffing attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Even stricter limiter for OTP requests / password reset to prevent
 * email-bombing and brute-forcing the OTP code.
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later.',
    code: 'OTP_RATE_LIMIT_EXCEEDED',
  },
});
