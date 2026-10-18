import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { deleteDocumentRecord, getDocumentById } from '@/lib/db/documents';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { id } = await params;
  const doc = await getDocumentById(id, user.uid);
  if (!doc) {
    return NextResponse.json({ error: 'ডকুমেন্ট পাওয়া যায়নি' }, { status: 404 });
  }

  return NextResponse.json(doc);
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteDocumentRecord(id, user.uid);

  if (!deleted) {
    return NextResponse.json({ error: 'ডকুমেন্ট মুছে ফেলা যায়নি' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'ডকুমেন্ট সফলভাবে মুছে ফেলা হয়েছে' });
}
