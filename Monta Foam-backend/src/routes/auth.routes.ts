import { Router } from 'express';
import {
  register, verifyEmail, resendOtp, login, googleAuth, googleAuthStart, googleAuthCallback,
  refreshTokens, logout, forgotPassword, resetPassword, getMe,
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter, otpLimiter } from '../middlewares/rateLimiter.middleware';
import {
  registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema,
  forgotPasswordSchema, resetPasswordSchema, googleAuthSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/register',          authLimiter, validate(registerSchema),      register);
router.post('/verify-email',      otpLimiter,  validate(verifyOtpSchema),     verifyEmail);
router.post('/resend-otp',        otpLimiter,  validate(resendOtpSchema),     resendOtp);
router.post('/login',             authLimiter, validate(loginSchema),         login);
router.get('/google/start',       authLimiter,                                googleAuthStart);
router.get('/google/callback',                                               googleAuthCallback);
router.post('/google',            authLimiter, validate(googleAuthSchema),    googleAuth);
router.post('/refresh',                                                        refreshTokens);
router.post('/logout',            authenticate,                               logout);
router.post('/forgot-password',   otpLimiter,  validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password',    otpLimiter,  validate(resetPasswordSchema),  resetPassword);
router.get('/me',                 authenticate,                               getMe);

export default router;
