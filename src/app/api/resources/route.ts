import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserResources, createResource } from '@/lib/db/resources';
import { resourceItemSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;

  try {
    const resources = await getUserResources(user.uid, category, search);
    return NextResponse.json(resources);
  } catch (err: any) {
    return NextResponse.json({ error: 'রিসোর্স লোড করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = resourceItemSchema.parse(body);

    const newResource = await createResource(user.uid, validatedData as any);
    return NextResponse.json({ success: true, data: newResource }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json(
        { error: 'ভ্যালিডেশন ত্রুটি', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'রিসোর্স সংরক্ষণ করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
