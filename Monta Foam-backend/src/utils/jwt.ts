import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string; // user id
  role: Role;
  isVerified: boolean;
}

export interface RefreshTokenPayload {
  sub: string; // user id
  tokenId: string; // unique id for this refresh token (rotation tracking)
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};

/**
 * Hash a refresh token before storing it in the database.
 * We never store raw refresh tokens - only their SHA-256 hash,
 * so a DB leak cannot be used to forge sessions directly.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateTokenId = (): string => crypto.randomUUID();
