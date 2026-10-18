import { ObjectId, Filter } from 'mongodb';
import { getDb } from '../mongodb';
import { InterviewQuestion, InterviewSession } from '../types';
import { STARTER_INTERVIEW_QUESTIONS } from '../constants/bengali';

// Interview Questions
export async function getUserInterviewQuestions(
  userId: string,
  category?: string,
  needsRevisionOnly?: boolean
) {
  const db = await getDb();
  const filter: Filter<any> = { userId };

  if (category && category !== 'all') {
    filter.category = category;
  }
  if (needsRevisionOnly) {
    filter.needsRevision = true;
  }

  let questions = await db
    .collection('interviewQuestions')
    .find(filter)
    .sort({ confidenceLevel: 1, createdAt: -1 })
    .toArray();

  // If user has no questions yet and no filter applied, seed optional starter questions
  if (questions.length === 0 && !category && !needsRevisionOnly) {
    const totalCount = await db.collection('interviewQuestions').countDocuments({ userId });
    if (totalCount === 0) {
      const now = new Date().toISOString();
      const starters = STARTER_INTERVIEW_QUESTIONS.map((q) => ({
        ...q,
        userId,
        isStarter: true,
        createdAt: now,
        updatedAt: now,
      }));
      await db.collection('interviewQuestions').insertMany(starters);
      questions = await db
        .collection('interviewQuestions')
        .find({ userId })
        .sort({ confidenceLevel: 1 })
        .toArray();
    }
  }

  return questions.map((doc) => ({
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  })) as InterviewQuestion[];
}

export async function createInterviewQuestion(
  userId: string,
  data: Omit<InterviewQuestion, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<InterviewQuestion> {
  const db = await getDb();
  const now = new Date().toISOString();

  const newDoc = {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('interviewQuestions').insertOne(newDoc);
  return {
    ...newDoc,
    id: result.insertedId.toString(),
    _id: result.insertedId.toString(),
  } as InterviewQuestion;
}

export async function updateInterviewQuestion(
  id: string,
  userId: string,
  data: Partial<InterviewQuestion>
): Promise<InterviewQuestion | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const now = new Date().toISOString();

  delete (data as any).userId;
  delete (data as any)._id;
  delete (data as any).id;

  const result = await db.collection('interviewQuestions').findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: { ...data, updatedAt: now } },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return {
    ...result,
    id: result._id.toString(),
    _id: result._id.toString(),
  } as InterviewQuestion;
}

export async function deleteInterviewQuestion(id: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db.collection('interviewQuestions').deleteOne({
    _id: new ObjectId(id),
    userId,
  });
  return result.deletedCount > 0;
}

// Interview Sessions
export async function getUserInterviewSessions(userId: string, applicationId?: string) {
  const db = await getDb();
  const filter: Filter<any> = { userId };
  if (applicationId) {
    filter.applicationId = applicationId;
  }

  const items = await db
    .collection('interviewSessions')
    .find(filter)
    .sort({ interviewDate: -1, createdAt: -1 })
    .toArray();

  return items.map((doc) => ({
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
  })) as InterviewSession[];
}

export async function createInterviewSession(
  userId: string,
  data: Omit<InterviewSession, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<InterviewSession> {
  const db = await getDb();
  const now = new Date().toISOString();

  const newDoc = {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('interviewSessions').insertOne(newDoc);
  return {
    ...newDoc,
    id: result.insertedId.toString(),
    _id: result.insertedId.toString(),
  } as InterviewSession;
}

export async function updateInterviewSession(
  id: string,
  userId: string,
  data: Partial<InterviewSession>
): Promise<InterviewSession | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const now = new Date().toISOString();

  delete (data as any).userId;
  delete (data as any)._id;
  delete (data as any).id;

  const result = await db.collection('interviewSessions').findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: { ...data, updatedAt: now } },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return {
    ...result,
    id: result._id.toString(),
    _id: result._id.toString(),
  } as InterviewSession;
}

export async function deleteInterviewSession(id: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db.collection('interviewSessions').deleteOne({
    _id: new ObjectId(id),
    userId,
  });
  return result.deletedCount > 0;
}
