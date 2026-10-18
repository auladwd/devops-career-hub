import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserInterviewQuestions, createInterviewQuestion } from '@/lib/db/interviews';
import { interviewQuestionSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const needsRevision = searchParams.get('needsRevision') === 'true';

  try {
    const questions = await getUserInterviewQuestions(user.uid, category, needsRevision);
    return NextResponse.json(questions);
  } catch (err: any) {
    return NextResponse.json({ error: 'প্রশ্নাবলী লোড করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = interviewQuestionSchema.parse(body);

    const newQuestion = await createInterviewQuestion(user.uid, validatedData as any);
    return NextResponse.json({ success: true, data: newQuestion }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json(
        { error: 'ভ্যালিডেশন ত্রুটি', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'প্রশ্ন যুক্ত করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
