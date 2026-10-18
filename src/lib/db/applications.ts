import { ObjectId, Filter } from 'mongodb';
import { getDb } from '../mongodb';
import { JobApplication, ApplicationStatus } from '../types';

export interface ApplicationQueryParams {
  search?: string;
  status?: string;
  source?: string;
  workArrangement?: string;
  employmentType?: string;
  sortBy?: 'applicationDate' | 'nextFollowUpDate' | 'company' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function getUserApplications(userId: string, params: ApplicationQueryParams = {}) {
  const db = await getDb();
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  // Strict multi-user isolation: always filter by authenticated userId
  const filter: Filter<any> = { userId };

  if (params.status && params.status !== 'all') {
    filter.status = params.status;
  }
  if (params.source && params.source !== 'all') {
    filter.source = params.source;
  }
  if (params.workArrangement && params.workArrangement !== 'all') {
    filter.workArrangement = params.workArrangement;
  }
  if (params.employmentType && params.employmentType !== 'all') {
    filter.employmentType = params.employmentType;
  }
  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    filter.$or = [
      { company: { $regex: s, $options: 'i' } },
      { position: { $regex: s, $options: 'i' } },
      { location: { $regex: s, $options: 'i' } },
      { tags: { $in: [new RegExp(s, 'i')] } },
    ];
  }

  const sortField = params.sortBy || 'createdAt';
  const sortDirection = params.sortOrder === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    db
      .collection('jobApplications')
      .find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection('jobApplications').countDocuments(filter),
  ]);

  return {
    items: items.map((doc) => ({
      ...doc,
      id: doc._id.toString(),
      _id: doc._id.toString(),
    })) as JobApplication[],
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getApplicationById(id: string, userId: string): Promise<JobApplication | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  // Never query by id alone: Always include userId
  const doc = await db.collection('jobApplications').findOne({
    _id: new ObjectId(id),
    userId,
  });
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  } as JobApplication;
}

export async function checkDuplicateApplication(userId: string, company: string, position: string, excludeId?: string) {
  const db = await getDb();
  const filter: Filter<any> = {
    userId,
    company: { $regex: `^${company.trim()}$`, $options: 'i' },
  };
  if (excludeId && ObjectId.isValid(excludeId)) {
    filter._id = { $ne: new ObjectId(excludeId) };
  }

  const existing = await db.collection('jobApplications').find(filter).toArray();
  if (existing.length === 0) return null;

  const exactSameRole = existing.find(
    (app) => app.position.trim().toLowerCase() === position.trim().toLowerCase()
  );

  return {
    existingCount: existing.length,
    exactMatch: !!exactSameRole,
    matchedApplications: existing.map((app) => ({
      id: app._id.toString(),
      position: app.position,
      status: app.status,
      applicationDate: app.applicationDate,
    })),
  };
}

export async function createApplication(
  userId: string,
  data: Omit<JobApplication, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'statusHistory'>
): Promise<JobApplication> {
  const db = await getDb();
  const now = new Date().toISOString();

  const newDoc = {
    ...data,
    userId, // immutable owner identifier
    statusHistory: [
      {
        status: data.status,
        changedAt: now,
        note: 'আবেদন তৈরি করা হয়েছে',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('jobApplications').insertOne(newDoc);
  return {
    ...newDoc,
    id: result.insertedId.toString(),
    _id: result.insertedId.toString(),
  } as JobApplication;
}

export async function updateApplication(
  id: string,
  userId: string,
  data: Partial<JobApplication>,
  statusChangeNote?: string
): Promise<JobApplication | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const now = new Date().toISOString();

  // Retrieve current to check ownership and status change
  const current = await db.collection('jobApplications').findOne({
    _id: new ObjectId(id),
    userId,
  });
  if (!current) return null;

  // Protect userId from mass assignment
  delete (data as any).userId;
  delete (data as any)._id;
  delete (data as any).id;

  const updateFields: any = {
    ...data,
    updatedAt: now,
  };

  const pushOperations: any = {};

  if (data.status && data.status !== current.status) {
    pushOperations.statusHistory = {
      status: data.status,
      changedAt: now,
      note: statusChangeNote || `স্ট্যাটাস পরিবর্তন: ${data.status}`,
    };
  }

  const updateDoc: any = { $set: updateFields };
  if (Object.keys(pushOperations).length > 0) {
    updateDoc.$push = pushOperations;
  }

  const result = await db.collection('jobApplications').findOneAndUpdate(
    { _id: new ObjectId(id), userId }, // strict ownership match
    updateDoc,
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return {
    ...result,
    id: result._id.toString(),
    _id: result._id.toString(),
  } as JobApplication;
}

export async function deleteApplication(id: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db.collection('jobApplications').deleteOne({
    _id: new ObjectId(id),
    userId, // strict ownership match
  });
  return result.deletedCount > 0;
}
