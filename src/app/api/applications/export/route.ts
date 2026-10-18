import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserApplications } from '@/lib/db/applications';
import { generateUtf8Csv } from '@/lib/utils';
import { APPLICATION_STATUS_LABELS, WORK_ARRANGEMENT_LABELS, EMPLOYMENT_TYPE_LABELS, JOB_SOURCE_LABELS } from '@/lib/constants/bengali';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  // Fetch all applications for this user
  const result = await getUserApplications(user.uid, { limit: 1000 });
  const headers = [
    'কোম্পানি',
    'পদবী',
    'স্ট্যাটাস',
    'কাজের ধরণ',
    'চাকরির ধরণ',
    'উৎস',
    'আবেদনের তারিখ',
    'পরবর্তী ফলোআপ',
    'ইন্টারভিউ তারিখ',
    'লোকেশন',
    'বেতন পরিসীমা',
    'রিক্রুটার',
    'কন্টাক্ট',
    'জব লিঙ্ক',
    'নোট',
  ];

  const rows = result.items.map((app) => [
    app.company,
    app.position,
    APPLICATION_STATUS_LABELS[app.status] || app.status,
    WORK_ARRANGEMENT_LABELS[app.workArrangement] || app.workArrangement,
    EMPLOYMENT_TYPE_LABELS[app.employmentType] || app.employmentType,
    JOB_SOURCE_LABELS[app.source] || app.source,
    app.applicationDate || '',
    app.nextFollowUpDate || '',
    app.interviewDate || '',
    app.location || '',
    app.salaryRange || '',
    app.recruiterName || '',
    app.recruiterContact || '',
    app.url || '',
    app.notes || '',
  ]);

  const csv = generateUtf8Csv(headers, rows);
  const filename = `devops-applications-${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
