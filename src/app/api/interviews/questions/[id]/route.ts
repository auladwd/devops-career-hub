import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { updateInterviewQuestion, deleteInterviewQuestion } from '@/lib/db/interviews';
import { interviewQuestionSchema } from '@/lib/validations';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const validatedData = interviewQuestionSchema.partial().parse(body);

    const updated = await updateInterviewQuestion(id, user.uid, validatedData as any);
    if (!updated) {
      return NextResponse.json({ error: 'প্রশ্ন পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json(
        { error: 'ভ্যালিডেশন ত্রুটি', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'প্রশ্ন আপডেট করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteInterviewQuestion(id, user.uid);

  if (!deleted) {
    return NextResponse.json({ error: 'প্রশ্ন মুছে ফেলা যায়নি' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'প্রশ্ন মুছে ফেলা হয়েছে' });
}
