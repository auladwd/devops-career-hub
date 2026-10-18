import { ObjectId } from 'mongodb';
import { getDb } from '../mongodb';
import { RoadmapMilestone } from '../types';
import { DEFAULT_ROADMAP_MILESTONES } from '../constants/bengali';

export async function getUserRoadmap(userId: string): Promise<RoadmapMilestone[]> {
  const db = await getDb();
  let milestones = await db
    .collection('roadmapMilestones')
    .find({ userId })
    .sort({ order: 1, createdAt: 1 })
    .toArray();

  // If new user has no milestones yet, initialize with default 14 DevOps roadmap milestones
  if (milestones.length === 0) {
    const now = new Date().toISOString();
    const defaults = DEFAULT_ROADMAP_MILESTONES.map((item, index) => ({
      ...item,
      userId,
      order: index + 1,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    }));
    await db.collection('roadmapMilestones').insertMany(defaults);
    milestones = await db
      .collection('roadmapMilestones')
      .find({ userId })
      .sort({ order: 1 })
      .toArray();
  }

  return milestones.map((doc) => ({
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  })) as RoadmapMilestone[];
}

export async function getMilestoneById(id: string, userId: string): Promise<RoadmapMilestone | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection('roadmapMilestones').findOne({
    _id: new ObjectId(id),
    userId,
  });
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  } as RoadmapMilestone;
}

export async function createMilestone(
  userId: string,
  data: Omit<RoadmapMilestone, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<RoadmapMilestone> {
  const db = await getDb();
  const now = new Date().toISOString();

  // Determine highest order
  const highest = await db
    .collection('roadmapMilestones')
    .find({ userId })
    .sort({ order: -1 })
    .limit(1)
    .toArray();

  const nextOrder = highest.length > 0 ? (highest[0].order || 0) + 1 : 1;

  const newDoc = {
    ...data,
    userId,
    order: data.order || nextOrder,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('roadmapMilestones').insertOne(newDoc);
  return {
    ...newDoc,
    id: result.insertedId.toString(),
    _id: result.insertedId.toString(),
  } as RoadmapMilestone;
}

export async function updateMilestone(
  id: string,
  userId: string,
  data: Partial<RoadmapMilestone>
): Promise<RoadmapMilestone | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const now = new Date().toISOString();

  delete (data as any).userId;
  delete (data as any)._id;
  delete (data as any).id;

  const updateFields: any = { ...data, updatedAt: now };
  if (data.status === 'completed' && !data.completedDate) {
    updateFields.completedDate = now;
    updateFields.progressPercent = 100;
  }

  const result = await db.collection('roadmapMilestones').findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return {
    ...result,
    id: result._id.toString(),
    _id: result._id.toString(),
  } as RoadmapMilestone;
}

export async function deleteMilestone(id: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db.collection('roadmapMilestones').deleteOne({
    _id: new ObjectId(id),
    userId,
  });
  return result.deletedCount > 0;
}

export async function calculateRoadmapProgress(userId: string) {
  const milestones = await getUserRoadmap(userId);
  if (milestones.length === 0) return 0;
  const totalPercent = milestones.reduce((sum, m) => sum + (m.progressPercent || 0), 0);
  return Math.round(totalPercent / milestones.length);
}
