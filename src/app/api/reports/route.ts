import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getDashboardMetrics } from '@/lib/db/analytics';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const metrics = await getDashboardMetrics(user.uid);
    return NextResponse.json(metrics);
  } catch (err: any) {
    console.error('Error calculating dashboard metrics:', err);
    return NextResponse.json({ error: 'মেট্রিক্স লোড করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
