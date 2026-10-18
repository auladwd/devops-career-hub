import { getDb } from '../mongodb';
import { UserPreferences } from '../types';
import { deleteFromCloudinary } from '../cloudinary';

export async function getUserPreferences(
  userId: string,
  email?: string,
  displayName?: string,
  photoURL?: string
): Promise<UserPreferences> {
  const db = await getDb();
  let prefs = await db.collection('userPreferences').findOne({ userId });

  if (!prefs) {
    const now = new Date().toISOString();
    const defaultPrefs: UserPreferences = {
      userId,
      email: email || '',
      displayName: displayName || 'DevOps Engineer',
      photoURL: photoURL || '',
      timezone: 'Asia/Dhaka',
      theme: 'system',
      dailyPracticeGoalMinutes: 60,
      weeklyPracticeGoalHours: 10,
      defaultApplicationStatus: 'applied',
      customCategories: [],
      createdAt: now,
      updatedAt: now,
    };
    const { _id, ...toInsert } = defaultPrefs;
    const res = await db.collection('userPreferences').insertOne(toInsert as any);
    return { ...defaultPrefs, id: res.insertedId.toString(), _id: res.insertedId.toString() };
  }

  return {
    ...prefs,
    id: prefs._id.toString(),
    _id: prefs._id.toString(),
  } as unknown as UserPreferences;
}

export async function updateUserPreferences(
  userId: string,
  data: Partial<UserPreferences>
): Promise<UserPreferences | null> {
  const db = await getDb();
  const now = new Date().toISOString();

  delete (data as any).userId;
  delete (data as any)._id;
  delete (data as any).id;

  const result = await db.collection('userPreferences').findOneAndUpdate(
    { userId },
    { $set: { ...data, updatedAt: now } },
    { returnDocument: 'after', upsert: true }
  );

  if (!result) return null;
  return {
    ...result,
    id: result._id.toString(),
    _id: result._id.toString(),
  } as unknown as UserPreferences;
}

/**
 * Completely purges all data belonging to this user across all collections
 * and cleans up Cloudinary files.
 */
export async function deleteUserAccountAndData(userId: string): Promise<boolean> {
  const db = await getDb();

  // 1. Fetch all user documents to clean up Cloudinary assets
  const userDocs = await db.collection('documents').find({ userId }).toArray();
  for (const doc of userDocs) {
    if (doc.publicId) {
      try {
        await deleteFromCloudinary(doc.publicId, userId);
      } catch (err) {
        console.warn('Notice deleting Cloudinary file:', err);
      }
    }
  }

  // 2. Cascade delete all MongoDB documents matching this userId
  await Promise.all([
    db.collection('jobApplications').deleteMany({ userId }),
    db.collection('practiceSessions').deleteMany({ userId }),
    db.collection('roadmapMilestones').deleteMany({ userId }),
    db.collection('tasks').deleteMany({ userId }),
    db.collection('interviewQuestions').deleteMany({ userId }),
    db.collection('interviewSessions').deleteMany({ userId }),
    db.collection('notes').deleteMany({ userId }),
    db.collection('resources').deleteMany({ userId }),
    db.collection('documents').deleteMany({ userId }),
    db.collection('userPreferences').deleteMany({ userId }),
  ]);

  return true;
}
