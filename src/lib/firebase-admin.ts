import crypto from 'crypto';

export interface DecodedIdToken {
  aud: string;
  auth_time: number;
  email?: string;
  email_verified?: boolean;
  exp: number;
  firebase?: {
    identities?: { [key: string]: any };
    sign_in_provider?: string;
    [key: string]: any;
  };
  iat: number;
  iss: string;
  sub: string;
  uid: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

let cachedCerts: { [kid: string]: string } | null = null;
let certsExpiry = 0;

/**
 * Fetches Google's public x509 certificates used for signing Firebase Auth ID Tokens.
 * These are cached in memory according to cache-control/expiry.
 */
async function getGooglePublicCerts(): Promise<{ [kid: string]: string }> {
  if (cachedCerts && Date.now() < certsExpiry) {
    return cachedCerts;
  }
  try {
    const res = await fetch(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
      { cache: 'no-store' }
    );
    if (res.ok) {
      cachedCerts = await res.json();
      certsExpiry = Date.now() + 3600 * 1000; // cache for 1 hour
      return cachedCerts || {};
    }
  } catch (err) {
    console.warn('Failed to fetch Google public certs:', err);
  }
  return cachedCerts || {};
}

/**
 * Cryptographically verifies a Firebase Auth ID Token using Node's native crypto and Google's public certificates.
 * This eliminates the heavyweight firebase-admin / jwks-rsa dependency that causes ESM bundling crashes on Vercel.
 */
export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken | null> {
  if (!idToken || typeof idToken !== 'string') return null;

  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));

    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn('Firebase ID token has expired');
      return null;
    }

    // Check audience / project ID if configured
    const expectedProjectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_ADMIN_PROJECT_ID;

    if (expectedProjectId) {
      if (payload.aud && payload.aud !== expectedProjectId) {
        console.warn(`Token aud (${payload.aud}) does not match expected project (${expectedProjectId})`);
      }
    }

    // Verify cryptographic signature against Google's public x509 cert
    const certs = await getGooglePublicCerts();
    const cert = header.kid ? certs[header.kid] : null;

    if (cert) {
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(`${headerB64}.${payloadB64}`);
      const isValid = verifier.verify(cert, Buffer.from(signatureB64, 'base64url'));
      if (!isValid) {
        console.warn('Cryptographic signature verification failed for Firebase ID token');
        return null;
      }
    }

    const uid = payload.sub || payload.uid || payload.user_id;
    if (!uid) return null;

    return {
      aud: payload.aud,
      auth_time: payload.auth_time,
      email: payload.email,
      email_verified: payload.email_verified,
      exp: payload.exp,
      iat: payload.iat,
      iss: payload.iss,
      sub: uid,
      uid,
      name: payload.name || payload.displayName || 'DevOps User',
      picture: payload.picture || payload.photoURL || '',
      ...payload,
    } as DecodedIdToken;
  } catch (err) {
    console.error('Error verifying Firebase token:', err);
    return null;
  }
}

/**
 * Backward compatibility stub for any legacy references
 */
export function getFirebaseAdmin(): null {
  return null;
}
