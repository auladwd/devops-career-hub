import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserRoadmap, createMilestone, calculateRoadmapProgress } from '@/lib/db/roadmap';
import { roadmapMilestoneSchema } from '@/lib/validations';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const [milestones, overallProgress] = await Promise.all([
      getUserRoadmap(user.uid),
      calculateRoadmapProgress(user.uid),
    ]);

    return NextResponse.json({
      milestones,
      overallProgress,
    });
  } catch (err: any) {
    console.error('Error fetching roadmap:', err);
    return NextResponse.json({ error: 'রোডম্যাপ লোড করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = roadmapMilestoneSchema.parse(body);

    const newMilestone = await createMilestone(user.uid, validatedData as any);
    return NextResponse.json({ success: true, data: newMilestone }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json(
        { error: 'ভ্যালিডেশন ত্রুটি', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'মাইলস্টোন তৈরিতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
