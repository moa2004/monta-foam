import { z } from 'zod';

// Strong password policy: min 8 chars, upper, lower, number, special char
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    code: z.string().length(6, 'OTP code must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    code: z.string().length(6, 'OTP code must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
    newPassword: passwordSchema,
  }),
});

export const googleAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'Google ID token is required'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>['body'];
export type ResendOtpInput = z.infer<typeof resendOtpSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>['body'];
