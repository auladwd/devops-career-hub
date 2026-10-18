import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserInterviewSessions, createInterviewSession } from '@/lib/db/interviews';
import { interviewSessionSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const applicationId = searchParams.get('applicationId') || undefined;

  try {
    const sessions = await getUserInterviewSessions(user.uid, applicationId);
    return NextResponse.json(sessions);
  } catch (err: any) {
    return NextResponse.json({ error: 'ইন্টারভিউ সেশন লোড করতে ব্যর্থ' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = interviewSessionSchema.parse(body);

    const newSession = await createInterviewSession(user.uid, validatedData as any);
    return NextResponse.json({ success: true, data: newSession }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json(
        { error: 'ভ্যালিডেশন ত্রুটি', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'ইন্টারভিউ সেশন সেভ করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
