import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { AuthUser } from './types';
import { verifyFirebaseToken } from './firebase-admin';

export const SESSION_COOKIE_NAME = 'dch_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'devops-career-hub-secure-session-secret-key-32chars';

export interface ServerSession {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  createdAt: number;
}

// Signs session payload using HMAC SHA256
export function createSessionToken(payload: ServerSession): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

// Verifies session token
export function verifySessionToken(token: string): ServerSession | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(data)
      .digest('base64url');

    // Constant-time comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const json = Buffer.from(data, 'base64url').toString('utf-8');
    const session: ServerSession = JSON.parse(json);

    // Session valid for 14 days
    const maxAge = 14 * 24 * 60 * 60 * 1000;
    if (Date.now() - session.createdAt > maxAge) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Derives the authenticated user strictly from server-verified session cookie or Bearer token.
 * Never trusts client-supplied user IDs in request bodies or query params.
 */
export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionCookie) {
    const session = verifySessionToken(sessionCookie);
    if (session && session.uid) {
      return {
        uid: session.uid,
        email: session.email,
        displayName: session.name,
        photoURL: session.picture,
      };
    }
  }

  // Also check Authorization header for programmatic testing or direct API calls
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    // Check if it is a signed session token
    const session = verifySessionToken(token);
    if (session && session.uid) {
      return {
        uid: session.uid,
        email: session.email,
        displayName: session.name,
        photoURL: session.picture,
      };
    }
    // Alternatively check if it is a raw Firebase ID token
    const decoded = await verifyFirebaseToken(token);
    if (decoded && decoded.uid) {
      return {
        uid: decoded.uid,
        email: decoded.email,
        displayName: decoded.name,
        photoURL: decoded.picture,
      };
    }
  }

  return null;
}

/**
 * Asserts user is authenticated, throws an error or returns user
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthenticatedUser();
  if (!user || !user.uid) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}
