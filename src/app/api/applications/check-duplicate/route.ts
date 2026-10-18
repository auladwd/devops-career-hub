import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { checkDuplicateApplication } from '@/lib/db/applications';

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const { company, position, excludeId } = await req.json();
    if (!company || !position) {
      return NextResponse.json({ duplicate: null });
    }

    const result = await checkDuplicateApplication(user.uid, company, position, excludeId);
    return NextResponse.json({ duplicate: result });
  } catch (err: any) {
    return NextResponse.json({ error: 'চেক করতে ব্যর্থ' }, { status: 500 });
  }
}
