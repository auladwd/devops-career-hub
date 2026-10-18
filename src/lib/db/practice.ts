import { ObjectId, Filter } from 'mongodb';
import { getDb } from '../mongodb';
import { PracticeSession } from '../types';

export interface PracticeQueryParams {
  category?: string;
  difficulty?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export async function getUserPracticeSessions(userId: string, params: PracticeQueryParams = {}) {
  const db = await getDb();
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const filter: Filter<any> = { userId };

  if (params.category && params.category !== 'all') {
    filter.category = params.category;
  }
  if (params.difficulty && params.difficulty !== 'all') {
    filter.difficulty = params.difficulty;
  }
  if (params.status && params.status !== 'all') {
    filter.status = params.status;
  }
  if (params.startDate || params.endDate) {
    filter.practiceDate = {};
    if (params.startDate) filter.practiceDate.$gte = params.startDate;
    if (params.endDate) filter.practiceDate.$lte = params.endDate;
  }
  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    filter.$or = [
      { title: { $regex: s, $options: 'i' } },
      { skill: { $regex: s, $options: 'i' } },
      { whatPracticed: { $regex: s, $options: 'i' } },
      { tags: { $in: [new RegExp(s, 'i')] } },
    ];
  }

  const [items, total] = await Promise.all([
    db
      .collection('practiceSessions')
      .find(filter)
      .sort({ practiceDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection('practiceSessions').countDocuments(filter),
  ]);

  return {
    items: items.map((doc) => ({
      ...doc,
      id: doc._id.toString(),
      _id: doc._id.toString(),
    })) as PracticeSession[],
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getPracticeSessionById(id: string, userId: string): Promise<PracticeSession | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection('practiceSessions').findOne({
    _id: new ObjectId(id),
    userId,
  });
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  } as PracticeSession;
}

export async function createPracticeSession(
  userId: string,
  data: Omit<PracticeSession, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<PracticeSession> {
  const db = await getDb();
  const now = new Date().toISOString();

  const newDoc = {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('practiceSessions').insertOne(newDoc);
  return {
    ...newDoc,
    id: result.insertedId.toString(),
    _id: result.insertedId.toString(),
  } as PracticeSession;
}

export async function updatePracticeSession(
  id: string,
  userId: string,
  data: Partial<PracticeSession>
): Promise<PracticeSession | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const now = new Date().toISOString();

  delete (data as any).userId;
  delete (data as any)._id;
  delete (data as any).id;

  const result = await db.collection('practiceSessions').findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: { ...data, updatedAt: now } },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return {
    ...result,
    id: result._id.toString(),
    _id: result._id.toString(),
  } as PracticeSession;
}

export async function deletePracticeSession(id: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db.collection('practiceSessions').deleteOne({
    _id: new ObjectId(id),
    userId,
  });
  return result.deletedCount > 0;
}

/**
 * Calculates practice streak and activity metrics for the user based on actual local calendar dates.
 */
export async function calculatePracticeMetrics(userId: string) {
  const db = await getDb();
  const sessions = await db
    .collection('practiceSessions')
    .find({ userId })
    .project({ practiceDate: 1, durationMinutes: 1, category: 1, skill: 1 })
    .toArray();

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalHours: 0,
      hoursThisWeek: 0,
      currentStreakDays: 0,
      categoryDistribution: [],
      recentHeatmap: {},
    };
  }

  let totalMinutes = 0;
  const dateMinutesMap: Record<string, number> = {};
  const categoryMap: Record<string, { minutes: number; count: number }> = {};

  const now = new Date();
  // Get start of current week (Monday)
  const dayOfWeek = now.getDay() || 7; // 1 = Monday, 7 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().split('T')[0];

  let thisWeekMinutes = 0;

  for (const s of sessions) {
    const mins = s.durationMinutes || 0;
    totalMinutes += mins;

    if (s.practiceDate >= mondayStr) {
      thisWeekMinutes += mins;
    }

    dateMinutesMap[s.practiceDate] = (dateMinutesMap[s.practiceDate] || 0) + mins;

    const cat = s.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { minutes: 0, count: 0 };
    }
    categoryMap[cat].minutes += mins;
    categoryMap[cat].count += 1;
  }

  // Calculate streak
  const uniqueDates = Object.keys(dateMinutesMap).sort().reverse();
  const todayStr = now.toISOString().split('T')[0];

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreakDays = 0;
  if (uniqueDates.length > 0) {
    const hasToday = uniqueDates.includes(todayStr);
    const hasYesterday = uniqueDates.includes(yesterdayStr);

    if (hasToday || hasYesterday) {
      let checkDate = new Date(hasToday ? todayStr : yesterdayStr);
      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(checkStr)) {
          currentStreakDays++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  const categoryDistribution = Object.entries(categoryMap).map(([category, val]) => ({
    category,
    hours: parseFloat((val.minutes / 60).toFixed(1)),
    count: val.count,
  }));

  return {
    totalSessions: sessions.length,
    totalHours: parseFloat((totalMinutes / 60).toFixed(1)),
    hoursThisWeek: parseFloat((thisWeekMinutes / 60).toFixed(1)),
    currentStreakDays,
    categoryDistribution,
    recentHeatmap: dateMinutesMap,
  };
}
