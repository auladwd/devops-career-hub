import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserPracticeSessions, createPracticeSession, calculatePracticeMetrics } from '@/lib/db/practice';
import { practiceSessionSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const difficulty = searchParams.get('difficulty') || undefined;
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    const [sessionsData, metrics] = await Promise.all([
      getUserPracticeSessions(user.uid, {
        category,
        difficulty,
        status,
        search,
        startDate,
        endDate,
        page,
        limit,
      }),
      calculatePracticeMetrics(user.uid),
    ]);

    return NextResponse.json({
      ...sessionsData,
      metrics,
    });
  } catch (err: any) {
    console.error('Error fetching practice sessions:', err);
    return NextResponse.json({ error: 'অনুশীলন সেশন লোড করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = practiceSessionSchema.parse(body);

    const newSession = await createPracticeSession(user.uid, validatedData as any);
    return NextResponse.json({ success: true, data: newSession }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json(
        { error: 'ভ্যালিডেশন ত্রুটি', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    console.error('Error logging practice session:', err);
    return NextResponse.json({ error: 'অনুশীলন সেশন সংরক্ষণ করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
