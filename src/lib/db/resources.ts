import { ObjectId, Filter } from 'mongodb';
import { getDb } from '../mongodb';
import { ResourceItem } from '../types';

export async function getUserResources(userId: string, category?: string, search?: string) {
  const db = await getDb();
  const filter: Filter<any> = { userId };

  if (category && category !== 'all') {
    filter.category = category;
  }
  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { title: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
      { tags: { $in: [new RegExp(s, 'i')] } },
      { url: { $regex: s, $options: 'i' } },
    ];
  }

  const items = await db
    .collection('resources')
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return items.map((doc) => ({
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  })) as ResourceItem[];
}

export async function createResource(
  userId: string,
  data: Omit<ResourceItem, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<ResourceItem> {
  const db = await getDb();
  const now = new Date().toISOString();

  const newDoc = {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('resources').insertOne(newDoc);
  return {
    ...newDoc,
    id: result.insertedId.toString(),
    _id: result.insertedId.toString(),
  } as ResourceItem;
}

export async function updateResource(
  id: string,
  userId: string,
  data: Partial<ResourceItem>
): Promise<ResourceItem | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const now = new Date().toISOString();

  delete (data as any).userId;
  delete (data as any)._id;
  delete (data as any).id;

  const result = await db.collection('resources').findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: { ...data, updatedAt: now } },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return {
    ...result,
    id: result._id.toString(),
    _id: result._id.toString(),
  } as ResourceItem;
}

export async function deleteResource(id: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db.collection('resources').deleteOne({
    _id: new ObjectId(id),
    userId,
  });
  return result.deletedCount > 0;
}
