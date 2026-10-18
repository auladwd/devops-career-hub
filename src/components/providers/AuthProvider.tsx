'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { AuthUser } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithDemo: (demoEmail?: string, demoName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithDemo: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSessionUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          return data.user;
        }
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionUser();

    // Listen to Firebase client auth changes if configured
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const sessionRes = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          if (sessionRes.ok) {
            const data = await sessionRes.json();
            setUser(data.user);
          }
        } catch (err) {
          console.error('Session sync error:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'সার্ভার সেশন প্রতিষ্ঠা ব্যর্থ হয়েছে');
      }

      const data = await res.json();
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Demo sign in for verifying multi-user data isolation (User A vs User B)
   * or testing when Google client credentials are not yet entered in .env
   */
  const signInWithDemo = async (
    demoEmail = 'user1@example.com',
    demoName = 'DevOps Engineer (User A)'
  ) => {
    setLoading(true);
    try {
      // Safe base64url encoder for browser environments
      const toBase64Url = (str: string) => {
        try {
          const utf8Bytes = new TextEncoder().encode(str);
          let binary = '';
          for (let i = 0; i < utf8Bytes.length; i++) {
            binary += String.fromCharCode(utf8Bytes[i]);
          }
          return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        } catch {
          return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
      };

      const uid = 'usr_' + toBase64Url(demoEmail).slice(0, 16);
      const header = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
      const payload = toBase64Url(
        JSON.stringify({
          uid,
          sub: uid,
          email: demoEmail,
          name: demoName,
          picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${demoEmail}`,
          iat: Math.floor(Date.now() / 1000),
        })
      );
      const mockIdToken = `${header}.${payload}.sig`;

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: mockIdToken }),
      });

      if (!res.ok) {
        throw new Error('ডেমো সেশন লগইন ব্যর্থ হয়েছে');
      }

      const data = await res.json();
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Demo sign-in failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      try {
        await fbSignOut(auth);
      } catch {}
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchSessionUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithDemo,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
