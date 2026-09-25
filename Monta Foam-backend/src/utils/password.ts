import argon2 from 'argon2';

/**
 * Hash a plaintext password using Argon2id (recommended variant for
 * password hashing - resistant to GPU cracking and side-channel attacks).
 */
export const hashPassword = async (plain: string): Promise<string> => {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
};

/**
 * Verify a plaintext password against a stored Argon2 hash.
 */
export const verifyPassword = async (hash: string, plain: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
};
