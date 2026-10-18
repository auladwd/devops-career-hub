import { NextResponse } from 'next/server';
import { getAuthenticatedUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { deleteUserAccountAndData } from '@/lib/db/settings';

export async function DELETE() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    // Purge all user data from MongoDB and Cloudinary
    await deleteUserAccountAndData(user.uid);

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: 'আপনার অ্যাকাউন্ট এবং সকল ডেটা স্থায়ীভাবে মুছে ফেলা হয়েছে।',
    });

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
  } catch (err: any) {
    console.error('Account deletion failed:', err);
    return NextResponse.json({ error: 'অ্যাকাউন্ট মুছতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
