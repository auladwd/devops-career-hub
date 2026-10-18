import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { createSessionToken, SESSION_COOKIE_NAME, getAuthenticatedUser } from '@/lib/auth';
import { getUserPreferences } from '@/lib/db/settings';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'আইডি টোকেন প্রদান করা হয়নি' }, { status: 400 });
    }

    const decoded = await verifyFirebaseToken(idToken);
    if (!decoded || !decoded.uid) {
      return NextResponse.json({ error: 'টোকেন যাচাইকরণ ব্যর্থ হয়েছে' }, { status: 401 });
    }

    const sessionPayload = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.displayName || 'DevOps User',
      picture: decoded.picture || decoded.photoURL || '',
      createdAt: Date.now(),
    };

    const sessionToken = createSessionToken(sessionPayload);

    // Save or update initial preferences for the user
    try {
      await getUserPreferences(decoded.uid, decoded.email, sessionPayload.name, sessionPayload.picture);
    } catch (e) {
      console.warn('Initial preferences notice:', e);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        uid: sessionPayload.uid,
        email: sessionPayload.email,
        displayName: sessionPayload.name,
        photoURL: sessionPayload.picture,
      },
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const fourteenDays = 14 * 24 * 60 * 60;

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: fourteenDays,
    });

    return response;
  } catch (error: any) {
    console.error('Session establishment error:', error);
    return NextResponse.json({ error: 'সার্ভার সেশন তৈরিতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'সফলভাবে লগআউট হয়েছে' });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
