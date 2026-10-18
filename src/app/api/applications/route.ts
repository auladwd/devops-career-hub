import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserApplications, createApplication, checkDuplicateApplication } from '@/lib/db/applications';
import { jobApplicationSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const status = searchParams.get('status') || undefined;
  const source = searchParams.get('source') || undefined;
  const workArrangement = searchParams.get('workArrangement') || undefined;
  const employmentType = searchParams.get('employmentType') || undefined;
  const sortBy = (searchParams.get('sortBy') as any) || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as any) || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    const result = await getUserApplications(user.uid, {
      search,
      status,
      source,
      workArrangement,
      employmentType,
      sortBy,
      sortOrder,
      page,
      limit,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error fetching applications:', err);
    return NextResponse.json({ error: 'আবেদনের তালিকা লোড করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = jobApplicationSchema.parse(body);

    // Check duplicate warning (does not block, but sends warning metadata)
    const duplicateInfo = await checkDuplicateApplication(
      user.uid,
      validatedData.company,
      validatedData.position
    );

    const newApplication = await createApplication(user.uid, validatedData as any);

    return NextResponse.json(
      {
        success: true,
        data: newApplication,
        duplicateWarning: duplicateInfo,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json(
        { error: 'ভ্যালিডেশন ত্রুটি', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    console.error('Error creating application:', err);
    return NextResponse.json({ error: 'আবেদন তৈরিতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
