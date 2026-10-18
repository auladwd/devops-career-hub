import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getApplicationById, updateApplication, deleteApplication } from '@/lib/db/applications';
import { jobApplicationSchema } from '@/lib/validations';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { id } = await params;
  const application = await getApplicationById(id, user.uid);

  if (!application) {
    return NextResponse.json({ error: 'আবেদনটি খুঁজে পাওয়া যায়নি' }, { status: 404 });
  }

  return NextResponse.json(application);
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const statusNote = body.statusChangeNote;
    delete body.statusChangeNote;

    const validatedData = jobApplicationSchema.partial().parse(body);
    const updated = await updateApplication(id, user.uid, validatedData, statusNote);

    if (!updated) {
      return NextResponse.json({ error: 'আবেদনটি আপডেট করা যায়নি বা খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json(
        { error: 'ভ্যালিডেশন ত্রুটি', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'আপডেটে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteApplication(id, user.uid);

  if (!deleted) {
    return NextResponse.json({ error: 'আবেদনটি মোছা যায়নি বা খুঁজে পাওয়া যায়নি' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'আবেদনটি সফলভাবে মুছে ফেলা হয়েছে' });
}
