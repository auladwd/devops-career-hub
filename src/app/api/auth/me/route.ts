import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserPreferences } from '@/lib/db/settings';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || !user.uid) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  try {
    const preferences = await getUserPreferences(user.uid, user.email, user.displayName, user.photoURL);
    return NextResponse.json({
      authenticated: true,
      user,
      preferences,
    });
  } catch {
    return NextResponse.json({
      authenticated: true,
      user,
      preferences: null,
    });
  }
}
