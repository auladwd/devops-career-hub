import { getDb } from '../mongodb';
import { DashboardMetrics, ApplicationStatus, JobApplication, PracticeSession, TaskItem, InterviewSession } from '../types';
import { calculatePracticeMetrics } from './practice';
import { calculateRoadmapProgress } from './roadmap';
import { getUserPreferences } from './settings';
import { APPLICATION_STATUS_LABELS } from '../constants/bengali';

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const db = await getDb();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Start of this week (Monday)
  const dayOfWeek = now.getDay() || 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  // Start of this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

  // 1. Fetch user job applications
  const applications = await db
    .collection('jobApplications')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  let totalApplications = applications.length;
  let applicationsThisWeek = 0;
  let applicationsThisMonth = 0;
  let inProgressApplications = 0;
  let pendingAssessments = 0;
  let offersReceived = 0;
  let rejections = 0;
  let followUpsDueCount = 0;

  const statusCountMap: Partial<Record<ApplicationStatus, number>> = {};

  for (const app of applications) {
    const status = app.status as ApplicationStatus;
    statusCountMap[status] = (statusCountMap[status] || 0) + 1;

    const dateVal = app.applicationDate || app.createdAt?.split('T')[0] || '';
    if (dateVal >= startOfWeekStr) applicationsThisWeek++;
    if (dateVal >= startOfMonthStr) applicationsThisMonth++;

    if (
      [
        'applied',
        'screening',
        'assessment',
        'interview_technical',
        'interview_hr',
        'interview_final',
      ].includes(status)
    ) {
      inProgressApplications++;
    }

    if (status === 'assessment') pendingAssessments++;
    if (status === 'offer') offersReceived++;
    if (status === 'rejected') rejections++;

    if (app.nextFollowUpDate && app.nextFollowUpDate <= todayStr && status !== 'offer' && status !== 'rejected' && status !== 'withdrawn') {
      followUpsDueCount++;
    }
  }

  // 2. Practice metrics
  const practiceMetrics = await calculatePracticeMetrics(userId);
  const roadmapCompletionPercent = await calculateRoadmapProgress(userId);

  // 3. User goals for weekly goal completion %
  const prefs = await getUserPreferences(userId);
  const weeklyTarget = prefs.weeklyPracticeGoalHours || 10;
  const weeklyGoalCompletionPercent = Math.min(
    100,
    Math.round(((practiceMetrics.hoursThisWeek || 0) / weeklyTarget) * 100)
  );

  // 4. Tasks metrics
  const [completedTasksCount, todayTasksDocs] = await Promise.all([
    db.collection('tasks').countDocuments({ userId, status: 'completed' }),
    db
      .collection('tasks')
      .find({ userId, dueDate: todayStr })
      .sort({ status: 1, priority: -1 })
      .toArray(),
  ]);

  // 5. Upcoming interviews
  const upcomingInterviewsDocs = await db
    .collection('interviewSessions')
    .find({ userId, interviewDate: { $gte: todayStr } })
    .sort({ interviewDate: 1 })
    .limit(5)
    .toArray();

  // 6. Recent practice sessions
  const recentPracticeDocs = await db
    .collection('practiceSessions')
    .find({ userId })
    .sort({ practiceDate: -1, createdAt: -1 })
    .limit(5)
    .toArray();

  // 7. Status distribution chart data
  const applicationStatusDistribution = (Object.keys(APPLICATION_STATUS_LABELS) as ApplicationStatus[])
    .map((status) => ({
      status,
      label: APPLICATION_STATUS_LABELS[status].split(' ')[0], // short Bengali label
      count: statusCountMap[status] || 0,
    }))
    .filter((item) => item.count > 0 || ['applied', 'screening', 'interview_technical', 'offer', 'rejected'].includes(item.status));

  // 8. Weekly practice trend (last 7 days)
  const weeklyPracticeHoursTrend: { day: string; date: string; hours: number }[] = [];
  const DAYS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = DAYS_BN[d.getDay()];
    const mins = practiceMetrics.recentHeatmap[dateStr] || 0;
    weeklyPracticeHoursTrend.push({
      day: dayName,
      date: dateStr,
      hours: parseFloat((mins / 60).toFixed(1)),
    });
  }

  // 9. Skill progress distribution (top 6 skills)
  const skillProgressDistribution = practiceMetrics.categoryDistribution
    .slice(0, 6)
    .map((item) => ({
      skill: item.category,
      hours: item.hours,
      sessions: item.count,
    }));

  return {
    totalApplications,
    applicationsThisWeek,
    applicationsThisMonth,
    inProgressApplications,
    pendingAssessments,
    upcomingInterviewsCount: upcomingInterviewsDocs.length,
    offersReceived,
    rejections,
    followUpsDueCount,

    totalPracticeSessions: practiceMetrics.totalSessions,
    totalPracticeHours: practiceMetrics.totalHours,
    practiceHoursThisWeek: practiceMetrics.hoursThisWeek,
    tasksCompleted: completedTasksCount,
    currentStreakDays: practiceMetrics.currentStreakDays,
    weeklyGoalCompletionPercent,
    roadmapCompletionPercent,

    applicationStatusDistribution,
    weeklyPracticeHoursTrend,
    skillProgressDistribution,

    recentApplications: applications.slice(0, 5).map((d) => ({
      ...d,
      id: d._id.toString(),
      _id: d._id.toString(),
    })) as JobApplication[],
    recentPracticeSessions: recentPracticeDocs.map((d) => ({
      ...d,
      id: d._id.toString(),
      _id: d._id.toString(),
    })) as PracticeSession[],
    todayTasks: todayTasksDocs.map((d) => ({
      ...d,
      id: d._id.toString(),
      _id: d._id.toString(),
    })) as TaskItem[],
    upcomingInterviews: upcomingInterviewsDocs.map((d) => ({
      ...d,
      id: d._id.toString(),
      _id: d._id.toString(),
    })) as InterviewSession[],
  };
}
