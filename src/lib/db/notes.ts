import { ObjectId, Filter } from 'mongodb';
import { getDb } from '../mongodb';
import { NoteItem } from '../types';

export async function getUserNotes(userId: string, category?: string, search?: string) {
  const db = await getDb();
  const filter: Filter<any> = { userId };

  if (category && category !== 'all') {
    filter.category = category;
  }
  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { title: { $regex: s, $options: 'i' } },
      { content: { $regex: s, $options: 'i' } },
      { tags: { $in: [new RegExp(s, 'i')] } },
    ];
  }

  const items = await db
    .collection('notes')
    .find(filter)
    .sort({ isPinned: -1, updatedAt: -1 })
    .toArray();

  return items.map((doc) => ({
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  })) as NoteItem[];
}

export async function getNoteById(id: string, userId: string): Promise<NoteItem | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection('notes').findOne({
    _id: new ObjectId(id),
    userId,
  });
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  } as NoteItem;
}

export async function createNote(
  userId: string,
  data: Omit<NoteItem, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<NoteItem> {
  const db = await getDb();
  const now = new Date().toISOString();

  const newDoc = {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('notes').insertOne(newDoc);
  return {
    ...newDoc,
    id: result.insertedId.toString(),
    _id: result.insertedId.toString(),
  } as NoteItem;
}

export async function updateNote(
  id: string,
  userId: string,
  data: Partial<NoteItem>
): Promise<NoteItem | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const now = new Date().toISOString();

  delete (data as any).userId;
  delete (data as any)._id;
  delete (data as any).id;

  const result = await db.collection('notes').findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: { ...data, updatedAt: now } },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return {
    ...result,
    id: result._id.toString(),
    _id: result._id.toString(),
  } as NoteItem;
}

export async function deleteNote(id: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db.collection('notes').deleteOne({
    _id: new ObjectId(id),
    userId,
  });
  return result.deletedCount > 0;
}
