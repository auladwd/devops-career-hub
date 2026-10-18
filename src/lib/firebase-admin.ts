import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';

let adminApp: App | null = null;

export function getFirebaseAdmin(): App | null {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
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
      console.error('Firebase Admin initialization error:', err);
      return null;
    }
  }

  return null;
}

export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken | null> {
  const fbAdmin = getFirebaseAdmin();
  if (fbAdmin) {
    try {
      return await getAuth(fbAdmin).verifyIdToken(idToken);
    } catch (err) {
      console.error('Failed to verify Firebase ID Token via Admin SDK:', err);
      return null;
    }
  }

  // Fallback for development/testing when service account is not yet configured:
  if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_AUTH === 'true') {
    try {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
        if (payload && (payload.sub || payload.uid)) {
          return {
            uid: payload.uid || payload.sub,
            email: payload.email,
            name: payload.name || payload.displayName,
            picture: payload.picture || payload.photoURL,
            ...payload,
          } as DecodedIdToken;
        }
      }
    } catch {
      return null;
    }
  }

  return null;
}
