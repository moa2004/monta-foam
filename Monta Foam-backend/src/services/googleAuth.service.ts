import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const tokenClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const getRedirectClient = (): OAuth2Client => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    throw AppError.serviceUnavailable('Google sign-in is not configured', 'GOOGLE_AUTH_NOT_CONFIGURED');
  }

  return new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_CALLBACK_URL,
  );
};

export interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  avatar?: string;
  emailVerified: boolean;
}

/**
 * Verifies a Google ID token (sent from the frontend after Google Sign-In)
 * and extracts the user's verified profile information.
 */
export const verifyGoogleIdToken = async (idToken: string): Promise<GoogleProfile> => {
  try {
    const ticket = await tokenClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw AppError.unauthorized('Invalid Google token', 'INVALID_GOOGLE_TOKEN');
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      fullName: payload.name ?? payload.email.split('@')[0],
      avatar: payload.picture,
      emailVerified: payload.email_verified ?? false,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw AppError.unauthorized('Failed to verify Google token', 'INVALID_GOOGLE_TOKEN');
  }
};

export const getGoogleAuthorizationUrl = (state: string): string => {
  const client = getRedirectClient();
  return client.generateAuthUrl({
    access_type: 'online',
    include_granted_scopes: true,
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
    state,
  });
};

export const verifyGoogleAuthorizationCode = async (code: string): Promise<GoogleProfile> => {
  try {
    const client = getRedirectClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      throw AppError.unauthorized('Google did not return an ID token', 'INVALID_GOOGLE_TOKEN');
    }

    return await verifyGoogleIdToken(tokens.id_token);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw AppError.unauthorized('Failed to complete Google sign-in', 'GOOGLE_OAUTH_FAILED');
  }
};
