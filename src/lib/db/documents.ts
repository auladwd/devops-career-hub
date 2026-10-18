import { ObjectId, Filter } from 'mongodb';
import { getDb } from '../mongodb';
import { DocumentItem, DocumentCategory } from '../types';
import { deleteFromCloudinary } from '../cloudinary';

export async function getUserDocuments(userId: string, category?: DocumentCategory) {
  const db = await getDb();
  const filter: Filter<any> = { userId };
  if (category) {
    filter.category = category;
  }

  const items = await db
    .collection('documents')
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return items.map((doc) => ({
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  })) as DocumentItem[];
}

export async function getDocumentById(id: string, userId: string): Promise<DocumentItem | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection('documents').findOne({
    _id: new ObjectId(id),
    userId,
  });
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  } as DocumentItem;
}

export async function createDocumentRecord(
  userId: string,
  data: Omit<DocumentItem, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<DocumentItem> {
  const db = await getDb();
  const now = new Date().toISOString();

  const newDoc = {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('documents').insertOne(newDoc);
  return {
    ...newDoc,
    id: result.insertedId.toString(),
    _id: result.insertedId.toString(),
  } as DocumentItem;
}

export async function deleteDocumentRecord(id: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();

  const doc = await db.collection('documents').findOne({
    _id: new ObjectId(id),
    userId,
  });
  if (!doc) return false;

  // Clean up from Cloudinary if publicId exists
  if (doc.publicId) {
    try {
      await deleteFromCloudinary(doc.publicId, userId);
    } catch (err) {
      console.warn('Notice during Cloudinary cleanup:', err);
    }
  }

  const result = await db.collection('documents').deleteOne({
    _id: new ObjectId(id),
    userId,
  });

  return result.deletedCount > 0;
}
