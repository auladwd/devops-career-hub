import { MongoClient, Db } from 'mongodb';

const dbName = process.env.MONGODB_DB || 'devops_career_hub';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let indexesEnsured = false;

async function ensureIndexes(db: Db) {
  if (indexesEnsured) return;
  try {
    await Promise.all([
      db.collection('jobApplications').createIndex({ userId: 1, applicationDate: -1 }),
      db.collection('jobApplications').createIndex({ userId: 1, status: 1 }),
      db.collection('jobApplications').createIndex({ userId: 1, company: 1 }),

      db.collection('practiceSessions').createIndex({ userId: 1, practiceDate: -1 }),
      db.collection('practiceSessions').createIndex({ userId: 1, category: 1 }),

      db.collection('roadmapMilestones').createIndex({ userId: 1, order: 1 }),
      db.collection('tasks').createIndex({ userId: 1, dueDate: 1, status: 1 }),

      db.collection('interviewQuestions').createIndex({ userId: 1, category: 1 }),
      db.collection('interviewSessions').createIndex({ userId: 1, interviewDate: -1 }),

      db.collection('notes').createIndex({ userId: 1, isPinned: -1, updatedAt: -1 }),
      db.collection('resources').createIndex({ userId: 1, category: 1 }),
      db.collection('documents').createIndex({ userId: 1, createdAt: -1 }),
      db.collection('userPreferences').createIndex({ userId: 1 }, { unique: true }),
    ]);
    indexesEnsured = true;
  } catch (err) {
    // Index creation error logged gracefully
    console.warn('Index verification note:', err);
  }
}

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required to perform database operations.');
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri);
      await global._mongoClient.connect();
    }
    const db = global._mongoClient.db(dbName);
    await ensureIndexes(db);
    return db;
  }

  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
    await global._mongoClient.connect();
  }

  const db = global._mongoClient.db(dbName);
  await ensureIndexes(db);
  return db;
}

export default getDb;
