import { Response } from 'express';
import { env } from '../config/env';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const ACCESS_TOKEN_COOKIE = 'accessToken';

const baseOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  // Browsers handle host-only localhost cookies more consistently without a
  // Domain attribute. Production may still opt into an explicit domain.
  ...(env.COOKIE_DOMAIN && env.COOKIE_DOMAIN !== 'localhost'
    ? { domain: env.COOKIE_DOMAIN }
    : {}),
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth/refresh',
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...baseOptions });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...baseOptions, path: '/api/v1/auth/refresh' });
};
