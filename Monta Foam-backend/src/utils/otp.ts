import crypto from 'crypto';
import argon2 from 'argon2';
import { env } from '../config/env';

/**
 * Generate a numeric OTP code of configured length (default 6 digits).
 * Uses crypto.randomInt for cryptographically secure randomness.
 */
export const generateOtpCode = (): string => {
  const length = env.OTP_LENGTH;
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  const code = crypto.randomInt(min, max + 1);
  return code.toString().padStart(length, '0');
};

/**
 * Hash an OTP code before storing it (same approach as passwords -
 * OTPs are short-lived secrets and must not be stored in plaintext).
 */
export const hashOtp = async (code: string): Promise<string> => {
  return argon2.hash(code, { type: argon2.argon2id });
};

export const verifyOtp = async (hash: string, code: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, code);
  } catch {
    return false;
  }
};

export const getOtpExpiryDate = (): Date => {
  return new Date(Date.now() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000);
};
