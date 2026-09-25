import { Request, Response } from 'express';
import { OtpPurpose } from '@prisma/client';
import { randomBytes, timingSafeEqual } from 'crypto';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { hashPassword, verifyPassword } from '../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateTokenId,
} from '../utils/jwt';
import { generateOtpCode, hashOtp, verifyOtp, getOtpExpiryDate } from '../utils/otp';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies';
import { sendEmail, otpEmailTemplate } from '../services/email.service';
import {
  getGoogleAuthorizationUrl,
  verifyGoogleAuthorizationCode,
  verifyGoogleIdToken,
  type GoogleProfile,
} from '../services/googleAuth.service';
import { recordAuditLog, AuditActions } from '../services/auditLog.service';
import { notifyAdmins } from '../services/notification.service';
import type {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ResendOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  GoogleAuthInput,
} from '../validators/auth.validator';

// ─── helpers ────────────────────────────────────────────────────────────────

const issueTokens = async (userId: string) => {
  const tokenId = generateTokenId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, role: true, isVerified: true },
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role, isVerified: user.isVerified });
  const refreshToken = signRefreshToken({ sub: user.id, tokenId });

  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: hashToken(refreshToken) },
  });

  return { accessToken, refreshToken };
};

const GOOGLE_STATE_COOKIE = 'googleOAuthState';

const googleStateCookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'lax' as const,
  path: '/api/v1/auth/google',
  ...(env.COOKIE_DOMAIN && env.COOKIE_DOMAIN !== 'localhost'
    ? { domain: env.COOKIE_DOMAIN }
    : {}),
};

const safeEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

const findOrCreateGoogleUser = async (profile: GoogleProfile) => {
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.googleId }, { email: profile.email }] },
  });

  if (user?.isSuspended) {
    throw AppError.forbidden('This account has been suspended', 'ACCOUNT_SUSPENDED');
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName: profile.fullName,
        email: profile.email,
        googleId: profile.googleId,
        provider: 'GOOGLE',
        isVerified: true,
        avatar: profile.avatar,
      },
    });
    await notifyAdmins({
      title: 'New user registered via Google',
      message: `${user.fullName} (${user.email}) signed in with Google.`,
      type: 'NEW_USER',
      metadata: { userId: user.id },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId: profile.googleId, isVerified: true, avatar: profile.avatar ?? user.avatar },
    });
  }

  return user;
};

const finishGoogleLogin = async (profile: GoogleProfile, req: Request, res: Response) => {
  if (!profile.emailVerified) {
    throw AppError.unauthorized('Google account email is not verified', 'GOOGLE_EMAIL_NOT_VERIFIED');
  }

  const user = await findOrCreateGoogleUser(profile);
  const { accessToken, refreshToken } = await issueTokens(user.id);
  setAuthCookies(res, accessToken, refreshToken);
  await recordAuditLog({ action: AuditActions.GOOGLE_LOGIN, actorId: user.id, req });

  return {
    accessToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};

const sendOtp = async (userId: string, email: string, fullName: string, purpose: OtpPurpose) => {
  // Invalidate any prior unused OTPs for this user+purpose
  await prisma.oTP.updateMany({
    where: { userId, purpose, consumed: false },
    data: { consumed: true },
  });

  const code = generateOtpCode();
  const hashedCode = await hashOtp(code);

  await prisma.oTP.create({
    data: {
      userId,
      code: hashedCode,
      purpose,
      expiresAt: getOtpExpiryDate(),
    },
  });

  await sendEmail({
    to: email,
    subject: purpose === 'EMAIL_VERIFICATION' ? 'تأكيد بريدك الإلكتروني – مونتا فوم' : 'إعادة تعيين كلمة المرور – مونتا فوم',
    html: otpEmailTemplate(fullName, code, purpose === 'EMAIL_VERIFICATION' ? 'verification' : 'reset'),
  });
};

// ─── controllers ────────────────────────────────────────────────────────────

export const register = catchAsync(async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body as RegisterInput;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw AppError.conflict('An account with this email already exists', 'EMAIL_TAKEN');

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { fullName, email, password: hashed },
    select: { id: true, fullName: true, email: true },
  });

  await sendOtp(user.id, user.email, user.fullName, 'EMAIL_VERIFICATION');
  await recordAuditLog({ action: AuditActions.REGISTER, actorId: user.id, req });
  await notifyAdmins({
    title: 'New user registered',
    message: `${user.fullName} (${user.email}) has created an account.`,
    type: 'NEW_USER',
    metadata: { userId: user.id },
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Check your email for the verification code.',
    data: { userId: user.id },
  });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, code } = req.body as VerifyOtpInput;

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, isVerified: true, fullName: true } });
  if (!user) throw AppError.notFound('No account found with this email', 'USER_NOT_FOUND');
  if (user.isVerified) throw AppError.conflict('Email is already verified', 'ALREADY_VERIFIED');

  const otp = await prisma.oTP.findFirst({
    where: { userId: user.id, purpose: 'EMAIL_VERIFICATION', consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) throw AppError.badRequest('OTP is invalid or has expired', 'OTP_INVALID');
  const valid = await verifyOtp(otp.code, code);
  if (!valid) throw AppError.badRequest('Incorrect OTP code', 'OTP_INCORRECT');

  await prisma.$transaction([
    prisma.oTP.update({ where: { id: otp.id }, data: { consumed: true } }),
    prisma.user.update({ where: { id: user.id }, data: { isVerified: true } }),
  ]);

  await recordAuditLog({ action: AuditActions.EMAIL_VERIFIED, actorId: user.id, req });
  await notifyAdmins({ title: 'Email verified', message: `${user.fullName} verified their email.`, type: 'EMAIL_VERIFIED' });

  const { accessToken, refreshToken } = await issueTokens(user.id);
  setAuthCookies(res, accessToken, refreshToken);

  const authenticatedUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { id: true, fullName: true, email: true, role: true, isVerified: true },
  });

  res.json({
    success: true,
    message: 'Email verified successfully.',
    data: { accessToken, user: authenticatedUser },
  });
});

export const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body as ResendOtpInput;

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, isVerified: true, fullName: true } });
  if (!user) throw AppError.notFound('No account found with this email', 'USER_NOT_FOUND');
  if (user.isVerified) throw AppError.conflict('Email is already verified', 'ALREADY_VERIFIED');

  await sendOtp(user.id, email, user.fullName, 'EMAIL_VERIFICATION');
  await recordAuditLog({ action: AuditActions.OTP_REQUESTED, actorId: user.id, req });

  res.json({ success: true, message: 'Verification code resent. Check your email.' });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, fullName: true, email: true, password: true, role: true, isVerified: true, isSuspended: true, provider: true },
  });

  if (!user || !user.password) {
    await recordAuditLog({ action: AuditActions.LOGIN_FAILED, metadata: { email }, req });
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const valid = await verifyPassword(user.password, password);
  if (!valid) {
    await recordAuditLog({ action: AuditActions.LOGIN_FAILED, actorId: user.id, metadata: { email }, req });
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (user.isSuspended) throw AppError.forbidden('This account has been suspended', 'ACCOUNT_SUSPENDED');

  const { accessToken, refreshToken } = await issueTokens(user.id);
  setAuthCookies(res, accessToken, refreshToken);
  await recordAuditLog({ action: AuditActions.LOGIN_SUCCESS, actorId: user.id, req });

  res.json({
    success: true,
    message: 'Logged in successfully.',
    data: {
      accessToken,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, isVerified: user.isVerified },
    },
  });
});

export const googleAuth = catchAsync(async (req: Request, res: Response) => {
  const { idToken } = req.body as GoogleAuthInput;
  const profile = await verifyGoogleIdToken(idToken);
  const data = await finishGoogleLogin(profile, req, res);

  res.json({
    success: true,
    message: 'Logged in with Google successfully.',
    data,
  });
});

export const googleAuthStart = catchAsync(async (_req: Request, res: Response) => {
  const state = randomBytes(32).toString('hex');
  res.cookie(GOOGLE_STATE_COOKIE, state, {
    ...googleStateCookieOptions,
    maxAge: 10 * 60 * 1000,
  });
  res.redirect(getGoogleAuthorizationUrl(state));
});

export const googleAuthCallback = async (req: Request, res: Response): Promise<void> => {
  const callbackUrl = new URL('/auth/google/callback', env.CLIENT_URL);

  try {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const storedState = typeof req.cookies?.[GOOGLE_STATE_COOKIE] === 'string'
      ? req.cookies[GOOGLE_STATE_COOKIE]
      : '';

    res.clearCookie(GOOGLE_STATE_COOKIE, googleStateCookieOptions);

    if (req.query.error) {
      callbackUrl.searchParams.set('error', 'access_denied');
      res.redirect(callbackUrl.toString());
      return;
    }

    if (!code || !state || !storedState || !safeEqual(state, storedState)) {
      callbackUrl.searchParams.set('error', 'invalid_state');
      res.redirect(callbackUrl.toString());
      return;
    }

    const profile = await verifyGoogleAuthorizationCode(code);
    await finishGoogleLogin(profile, req, res);
    callbackUrl.searchParams.set('status', 'success');
    res.redirect(callbackUrl.toString());
  } catch (err) {
    logger.warn('Google OAuth callback failed', {
      error: err instanceof Error ? err.message : 'Unknown Google OAuth error',
    });
    callbackUrl.searchParams.set(
      'error',
      err instanceof AppError && err.code === 'ACCOUNT_SUSPENDED' ? 'account_suspended' : 'oauth_failed',
    );
    res.redirect(callbackUrl.toString());
  }
};

export const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const token: string | undefined = req.cookies?.refreshToken;
  if (!token) throw AppError.unauthorized('Refresh token missing', 'NO_REFRESH_TOKEN');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, refreshTokenHash: true, isSuspended: true },
  });

  if (!user || !user.refreshTokenHash) throw AppError.unauthorized('Session not found', 'SESSION_NOT_FOUND');
  if (user.isSuspended) throw AppError.forbidden('Account suspended', 'ACCOUNT_SUSPENDED');

  // Token rotation: stored hash must match – if not, possible replay attack
  if (user.refreshTokenHash !== hashToken(token)) {
    // Revoke all sessions (token family compromise)
    await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: null } });
    throw AppError.unauthorized('Refresh token reuse detected. Please log in again.', 'TOKEN_REUSE_DETECTED');
  }

  const { accessToken, refreshToken: newRefreshToken } = await issueTokens(user.id);
  setAuthCookies(res, accessToken, newRefreshToken);
  await recordAuditLog({ action: AuditActions.TOKEN_REFRESHED, actorId: user.id, req });

  res.json({ success: true, message: 'Tokens refreshed.', data: { accessToken } });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (userId) {
    await prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
    await recordAuditLog({ action: AuditActions.LOGOUT, actorId: userId, req });
  }
  clearAuthCookies(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, fullName: true } });
  // Always return success to prevent user enumeration
  if (!user) {
    res.json({ success: true, message: 'If this email exists, a reset code has been sent.' });
    return;
  }

  await sendOtp(user.id, email, user.fullName, 'PASSWORD_RESET');
  await recordAuditLog({ action: AuditActions.PASSWORD_RESET_REQUESTED, actorId: user.id, req });

  res.json({ success: true, message: 'If this email exists, a reset code has been sent.' });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body as ResetPasswordInput;

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, provider: true } });
  if (!user) throw AppError.notFound('No account found with this email', 'USER_NOT_FOUND');
  if (user.provider === 'GOOGLE') throw AppError.badRequest('Google accounts cannot reset passwords here', 'GOOGLE_ACCOUNT');

  const otp = await prisma.oTP.findFirst({
    where: { userId: user.id, purpose: 'PASSWORD_RESET', consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) throw AppError.badRequest('OTP is invalid or has expired', 'OTP_INVALID');
  const valid = await verifyOtp(otp.code, code);
  if (!valid) throw AppError.badRequest('Incorrect OTP code', 'OTP_INCORRECT');

  const hashed = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.oTP.update({ where: { id: otp.id }, data: { consumed: true } }),
    prisma.user.update({ where: { id: user.id }, data: { password: hashed, refreshTokenHash: null } }),
  ]);

  await recordAuditLog({ action: AuditActions.PASSWORD_RESET_SUCCESS, actorId: user.id, req });

  res.json({ success: true, message: 'Password reset successfully. Please log in again.' });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
    select: { id: true, fullName: true, email: true, role: true, isVerified: true, avatar: true, provider: true, createdAt: true },
  });
  res.json({ success: true, data: user });
});
