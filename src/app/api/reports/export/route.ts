import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'json';

  try {
    const db = await getDb();
    // Strictly isolate all queries by the authenticated user's uid
    const [
      applications,
      practiceSessions,
      roadmapMilestones,
      tasks,
      interviewQuestions,
      interviewSessions,
      notes,
      resources,
      documents,
      preferences,
    ] = await Promise.all([
      db.collection('jobApplications').find({ userId: user.uid }).toArray(),
      db.collection('practiceSessions').find({ userId: user.uid }).toArray(),
      db.collection('roadmapMilestones').find({ userId: user.uid }).toArray(),
      db.collection('tasks').find({ userId: user.uid }).toArray(),
      db.collection('interviewQuestions').find({ userId: user.uid }).toArray(),
      db.collection('interviewSessions').find({ userId: user.uid }).toArray(),
      db.collection('notes').find({ userId: user.uid }).toArray(),
      db.collection('resources').find({ userId: user.uid }).toArray(),
      db.collection('documents').find({ userId: user.uid }).toArray(),
      db.collection('userPreferences').findOne({ userId: user.uid }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
      preferences,
      applications,
      practiceSessions,
      roadmapMilestones,
      tasks,
      interviewQuestions,
      interviewSessions,
      notes,
      resources,
      documents,
    };

    if (format === 'json') {
      const jsonString = JSON.stringify(exportData, null, 2);
      const filename = `devops-career-hub-data-${user.uid}-${new Date().toISOString().split('T')[0]}.json`;
      return new NextResponse(jsonString, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(exportData);
  } catch (err: any) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'ডাটা এক্সপোর্ট করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
