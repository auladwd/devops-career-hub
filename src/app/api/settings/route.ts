import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserPreferences, updateUserPreferences } from '@/lib/db/settings';
import { userPreferencesSchema } from '@/lib/validations';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const prefs = await getUserPreferences(user.uid, user.email, user.displayName, user.photoURL);
    return NextResponse.json(prefs);
  } catch (err: any) {
    return NextResponse.json({ error: 'সেটিংস লোড করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = userPreferencesSchema.partial().parse(body);

    const updated = await updateUserPreferences(user.uid, validatedData);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json(
        { error: 'ভ্যালিডেশন ত্রুটি', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
