import { Request } from 'express';
import { prisma } from '../config/prisma';
import { logger } from '../config/logger';

interface AuditLogInput {
  action: string;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
  req?: Request;
}

/**
 * Persists an audit log entry. Audit logging must never break the
 * main request flow, so failures here are caught and logged only.
 */
export const recordAuditLog = async ({ action, actorId, metadata, req }: AuditLogInput): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        actorId: actorId ?? null,
        metadata: metadata ? (metadata as never) : undefined,
        ipAddress: req?.ip,
        userAgent: req?.headers['user-agent'],
      },
    });
  } catch (err) {
    logger.error('Failed to record audit log', { action, error: (err as Error).message });
  }
};

export const AuditActions = {
  REGISTER: 'USER_REGISTERED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  OTP_REQUESTED: 'OTP_REQUESTED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
  GOOGLE_LOGIN: 'GOOGLE_LOGIN',
  ROLE_CHANGED: 'ROLE_CHANGED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_UNSUSPENDED: 'USER_UNSUSPENDED',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  SERVICE_REQUEST_CREATED: 'SERVICE_REQUEST_CREATED',
} as const;
