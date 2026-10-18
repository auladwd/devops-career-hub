import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserTasks, createTask } from '@/lib/db/tasks';
import { taskItemSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const view = (searchParams.get('view') as any) || 'all';
  const priority = searchParams.get('priority') || undefined;
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;

  try {
    const tasks = await getUserTasks(user.uid, {
      view,
      priority,
      category,
      search,
    });
    return NextResponse.json(tasks);
  } catch (err: any) {
    console.error('Error fetching tasks:', err);
    return NextResponse.json({ error: 'টাস্ক লোড করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = taskItemSchema.parse(body);

    const newTask = await createTask(user.uid, validatedData as any);
    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json(
        { error: 'ভ্যালিডেশন ত্রুটি', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'টাস্ক তৈরি করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
