import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserDocuments, createDocumentRecord } from '@/lib/db/documents';
import { uploadToCloudinary, ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from '@/lib/cloudinary';
import { DocumentCategory } from '@/lib/types';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = (searchParams.get('category') as DocumentCategory) || undefined;

  try {
    const docs = await getUserDocuments(user.uid, category);
    return NextResponse.json(docs);
  } catch (err: any) {
    return NextResponse.json({ error: 'ডকুমেন্ট লোড করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const name = (formData.get('name') as string) || file?.name || 'Untitled Document';
    const category = (formData.get('category') as DocumentCategory) || 'resume';
    const notes = (formData.get('notes') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'কোনো ফাইল নির্বাচন করা হয়নি' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'ফাইলের আকার ১০ মেগাবাইটের (10MB) বেশি হতে পারবে না' },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'অসমর্থিত ফাইল ফরম্যাট। শুধুমাত্র PDF, Word Doc, বা ছবি সমর্থিত।' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to user-scoped Cloudinary storage
    const uploadResult = await uploadToCloudinary(buffer, file.name, user.uid, category as any);

    // Save document metadata in MongoDB
    const docRecord = await createDocumentRecord(user.uid, {
      name,
      originalFilename: file.name,
      publicId: uploadResult.publicId,
      secureUrl: uploadResult.secureUrl,
      format: uploadResult.format,
      bytes: uploadResult.bytes || file.size,
      category,
      notes,
    });

    return NextResponse.json({ success: true, data: docRecord }, { status: 201 });
  } catch (err: any) {
    console.error('File upload failed:', err);
    return NextResponse.json(
      { error: err.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
