import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../config/prisma';

export interface AuthenticatedUser {
  id: string;
  role: Role;
  isVerified: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Verifies the access token (from Authorization header or cookie),
 * attaches the authenticated user to req.user, and ensures the
 * account is not suspended.
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw AppError.unauthorized('Authentication token is missing', 'NO_TOKEN');
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, isVerified: true, isSuspended: true },
    });

    if (!user) {
      throw AppError.unauthorized('User no longer exists', 'USER_NOT_FOUND');
    }

    if (user.isSuspended) {
      throw AppError.forbidden('This account has been suspended', 'ACCOUNT_SUSPENDED');
    }

    req.user = { id: user.id, role: user.role, isVerified: user.isVerified };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(AppError.unauthorized('Invalid or expired access token', 'INVALID_TOKEN'));
  }
};

/**
 * Reads a valid access token when one is present, but keeps the route public
 * when the visitor is a guest. This is used by guest-capable endpoints that
 * should still associate records with a signed-in user.
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.accessToken;

    if (!token) return next();

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, isVerified: true, isSuspended: true },
    });

    if (user && !user.isSuspended) {
      req.user = { id: user.id, role: user.role, isVerified: user.isVerified };
    }

    next();
  } catch {
    // Invalid/expired credentials simply make this a guest request.
    next();
  }
};

/**
 * Restricts access to the given roles only. Must run after `authenticate`.
 */
export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required', 'NO_AUTH'));
    }
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('You do not have permission to perform this action', 'FORBIDDEN'));
    }
    next();
  };
};

/**
 * Requires the user's email to be verified.
 */
export const requireVerified = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(AppError.unauthorized('Authentication required', 'NO_AUTH'));
  }
  if (!req.user.isVerified) {
    return next(AppError.forbidden('Please verify your email address first', 'EMAIL_NOT_VERIFIED'));
  }
  next();
};
