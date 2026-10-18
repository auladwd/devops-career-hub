import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getPracticeSessionById, updatePracticeSession, deletePracticeSession } from '@/lib/db/practice';
import { practiceSessionSchema } from '@/lib/validations';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { id } = await params;
  const session = await getPracticeSessionById(id, user.uid);

  if (!session) {
    return NextResponse.json({ error: 'অনুশীলন সেশন পাওয়া যায়নি' }, { status: 404 });
  }

  return NextResponse.json(session);
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const validatedData = practiceSessionSchema.partial().parse(body);

    const updated = await updatePracticeSession(id, user.uid, validatedData as any);
    if (!updated) {
      return NextResponse.json({ error: 'সেশন পাওয়া যায়নি বা আপডেট করা যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json(
        { error: 'ভ্যালিডেশন ত্রুটি', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'সেশন আপডেট করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deletePracticeSession(id, user.uid);

  if (!deleted) {
    return NextResponse.json({ error: 'সেশন মুছে ফেলা যায়নি' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'সেশন সফলভাবে মুছে ফেলা হয়েছে' });
}
