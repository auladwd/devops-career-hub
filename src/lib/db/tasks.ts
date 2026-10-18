import { ObjectId, Filter } from 'mongodb';
import { getDb } from '../mongodb';
import { TaskItem } from '../types';

export interface TaskQueryParams {
  status?: string;
  priority?: string;
  view?: 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
  category?: string;
  search?: string;
}

export async function getUserTasks(userId: string, params: TaskQueryParams = {}) {
  const db = await getDb();
  const filter: Filter<any> = { userId };

  const todayStr = new Date().toISOString().split('T')[0];

  if (params.status && params.status !== 'all') {
    filter.status = params.status;
  }
  if (params.priority && params.priority !== 'all') {
    filter.priority = params.priority;
  }
  if (params.category && params.category !== 'all') {
    filter.category = params.category;
  }

  if (params.view === 'today') {
    filter.dueDate = todayStr;
  } else if (params.view === 'upcoming') {
    filter.dueDate = { $gt: todayStr };
    filter.status = { $ne: 'completed' };
  } else if (params.view === 'overdue') {
    filter.dueDate = { $lt: todayStr };
    filter.status = { $ne: 'completed' };
  } else if (params.view === 'completed') {
    filter.status = 'completed';
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    filter.$or = [
      { title: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
      { category: { $regex: s, $options: 'i' } },
    ];
  }

  const items = await db
    .collection('tasks')
    .find(filter)
    .sort({ dueDate: 1, priority: -1, createdAt: -1 })
    .toArray();

  return items.map((doc) => ({
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  })) as TaskItem[];
}

export async function getTaskById(id: string, userId: string): Promise<TaskItem | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection('tasks').findOne({
    _id: new ObjectId(id),
    userId,
  });
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  } as TaskItem;
}

export async function createTask(
  userId: string,
  data: Omit<TaskItem, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<TaskItem> {
  const db = await getDb();
  const now = new Date().toISOString();

  const newDoc = {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('tasks').insertOne(newDoc);
  return {
    ...newDoc,
    id: result.insertedId.toString(),
    _id: result.insertedId.toString(),
  } as TaskItem;
}

export async function updateTask(
  id: string,
  userId: string,
  data: Partial<TaskItem>
): Promise<TaskItem | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const now = new Date().toISOString();

  delete (data as any).userId;
  delete (data as any)._id;
  delete (data as any).id;

  const result = await db.collection('tasks').findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: { ...data, updatedAt: now } },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return {
    ...result,
    id: result._id.toString(),
    _id: result._id.toString(),
  } as TaskItem;
}

export async function deleteTask(id: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db.collection('tasks').deleteOne({
    _id: new ObjectId(id),
    userId,
  });
  return result.deletedCount > 0;
}
