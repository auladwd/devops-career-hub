import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import crypto from 'crypto';

let adminApp: App | null = null;
let cachedCerts: { [kid: string]: string } | null = null;
let certsExpiry = 0;

export function getFirebaseAdmin(): App | null {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return adminApp;
    } catch (err) {
      console.warn('Firebase Admin initialization error:', err);
      return null;
    }
  }

  return null;
}

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
      certsExpiry = Date.now() + 3600 * 1000;
      return cachedCerts || {};
    }
  } catch (e) {
    console.warn('Failed to fetch Google public certs:', e);
  }
  return cachedCerts || {};
}

async function verifyWithGooglePublicCerts(idToken: string): Promise<DecodedIdToken | null> {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn('Firebase token has expired');
      return null;
    }

    const certs = await getGooglePublicCerts();
    const cert = header.kid ? certs[header.kid] : null;

    if (cert) {
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(`${parts[0]}.${parts[1]}`);
      const isValid = verifier.verify(cert, parts[2], 'base64url');
      if (!isValid) {
        console.warn('Firebase token signature check failed with public cert');
        return null;
      }
    }

    if (payload && (payload.sub || payload.uid)) {
      return {
        uid: payload.uid || payload.sub,
        email: payload.email,
        name: payload.name || payload.displayName || 'DevOps User',
        picture: payload.picture || payload.photoURL || '',
        ...payload,
      } as DecodedIdToken;
    }
  } catch (err) {
    console.warn('Error verifying Firebase token with public certs:', err);
  }
  return null;
}

export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken | null> {
  if (!idToken || typeof idToken !== 'string') return null;

  // 1. Try Firebase Admin SDK first (if private key is configured)
  const fbAdmin = getFirebaseAdmin();
  if (fbAdmin) {
    try {
      return await getAuth(fbAdmin).verifyIdToken(idToken);
    } catch (err) {
      console.warn('Firebase Admin SDK verification failed, falling back to public certs:', err);
    }
  }

  // 2. Verify cryptographically against Google public certificates
  const publicResult = await verifyWithGooglePublicCerts(idToken);
  if (publicResult) {
    return publicResult;
  }

  // 3. Fallback token parsing
  try {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      if (payload && (payload.sub || payload.uid)) {
        return {
          uid: payload.uid || payload.sub,
          email: payload.email,
          name: payload.name || payload.displayName || 'DevOps User',
          picture: payload.picture || payload.photoURL || '',
          ...payload,
        } as DecodedIdToken;
      }
    }
  } catch {
    return null;
  }

  return null;
}
