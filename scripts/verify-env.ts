import { loadEnvConfig } from '@next/env';
import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

// 1. Load .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

interface CheckResult {
  service: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  message: string;
  details?: Record<string, string | number | boolean>;
}

const results: CheckResult[] = [];

async function checkMongoDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'devops_career_hub';

  if (!uri) {
    results.push({
      service: 'MongoDB Atlas',
      status: 'FAILED',
      message: 'MONGODB_URI পাওয়া যায়নি (.env.local এ মিসিং)',
    });
    return;
  }

  let client: MongoClient | null = null;
  try {
    const startTime = Date.now();
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    await client.connect();
    const db = client.db(dbName);
    const pingResult = await db.command({ ping: 1 });
    const latency = Date.now() - startTime;

    // Check collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    results.push({
      service: 'MongoDB Atlas',
      status: 'SUCCESS',
      message: `সফলভাবে কানেক্ট হয়েছে এবং ping রেসপন্স এসেছে (${latency}ms)`,
      details: {
        database: dbName,
        ping: pingResult.ok === 1 ? 'OK' : 'Unknown',
        totalCollections: collectionNames.length,
      },
    });
  } catch (err: any) {
    results.push({
      service: 'MongoDB Atlas',
      status: 'FAILED',
      message: `কানেকশন ব্যর্থ হয়েছে: ${err.message}`,
      details: {
        errorName: err.name || 'Error',
      },
    });
  } finally {
    if (client) {
      await client.close().catch(() => {});
    }
  }
}

async function checkFirebaseAdmin(): Promise<void> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    results.push({
      service: 'Firebase Token Verification',
      status: 'WARNING',
      message: 'সার্ভিস অ্যাকাউন্ট তথ্য প্রদান করা হয়নি। Google Public Certificates দিয়ে স্বয়ংক্রিয় ভেরিফিকেশন চালু থাকবে।',
      details: {
        hasProjectId: !!projectId,
        hasClientEmail: !!clientEmail,
        hasPrivateKey: !!privateKey,
      },
    });
    return;
  }

  const cleanedKey = privateKey.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
  const isValidFormat = cleanedKey.includes('-----BEGIN PRIVATE KEY-----') && cleanedKey.includes('-----END PRIVATE KEY-----');

  if (isValidFormat && clientEmail.includes('@')) {
    results.push({
      service: 'Firebase Token Verification',
      status: 'SUCCESS',
      message: 'Firebase Admin ক্রেডেনশিয়াল ফরম্যাট সঠিক ও প্রস্তুত',
      details: {
        projectId,
        clientEmail,
      },
    });
  } else {
    results.push({
      service: 'Firebase Token Verification',
      status: 'WARNING',
      message: 'Firebase Admin প্রাইভেট কী ফরম্যাটে ত্রুটি থাকতে পারে, তবে Public Certs ফলব্যাক কার্যকর থাকবে',
    });
  }
}

async function checkCloudinary(): Promise<void> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    results.push({
      service: 'Cloudinary Document Storage',
      status: 'FAILED',
      message: 'Cloudinary তথ্য মিসিং (CLOUD_NAME / API_KEY / API_SECRET)',
    });
    return;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const pingRes = await cloudinary.api.ping();

    results.push({
      service: 'Cloudinary Document Storage',
      status: 'SUCCESS',
      message: 'Cloudinary API কানেকশন সফল ও সচল',
      details: {
        cloudName,
        status: pingRes.status || 'ok',
      },
    });
  } catch (err: any) {
    results.push({
      service: 'Cloudinary Document Storage',
      status: 'FAILED',
      message: `Cloudinary যাচাই ব্যর্থ: ${err.message}`,
    });
  }
}

function checkFirebaseClientConfig(): void {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    results.push({
      service: 'Firebase Client (Browser SDK)',
      status: 'WARNING',
      message: 'কিছু ক্লায়েন্ট কনফিগ মিসিং (API_KEY, AUTH_DOMAIN, PROJECT_ID, অথবা APP_ID)',
      details: {
        hasApiKey: !!apiKey,
        hasAuthDomain: !!authDomain,
        hasProjectId: !!projectId,
        hasAppId: !!appId,
      },
    });
  } else {
    results.push({
      service: 'Firebase Client (Browser SDK)',
      status: 'SUCCESS',
      message: 'ক্লায়েন্ট সাইড Google Sign-In কনফিগারেশন উপস্থিত',
      details: {
        projectId,
        authDomain,
      },
    });
  }
}

function checkSessionSecret(): void {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    results.push({
      service: 'Session Secret',
      status: 'WARNING',
      message: 'SESSION_SECRET সংজ্ঞায়িত নেই (ডিফল্ট ফলব্যাক কী ব্যবহৃত হবে)',
    });
  } else if (secret.length < 32) {
    results.push({
      service: 'Session Secret',
      status: 'WARNING',
      message: 'SESSION_SECRET অন্তত ৩২ ক্যারেক্টার হওয়া বাঞ্ছনীয়',
    });
  } else {
    results.push({
      service: 'Session Secret',
      status: 'SUCCESS',
      message: 'সুরক্ষিত সেশন কুকি এনক্রিপশন কী উপস্থিত',
    });
  }
}

async function run(): Promise<void> {
  console.log('='.repeat(60));
  console.log('🔍 DevOps Career Hub: পরিবেশ ও কানেকশন ভেরিফিকেশন রিপোর্ট');
  console.log('='.repeat(60));

  console.log('⏳ ১/৫. MongoDB Atlas কানেকশন পরীক্ষা করা হচ্ছে...');
  await checkMongoDB();

  console.log('⏳ ২/৫. Firebase Admin SDK সার্ভিস অ্যাকাউন্ট পরীক্ষা করা হচ্ছে...');
  await checkFirebaseAdmin();

  console.log('⏳ ৩/৫. Cloudinary স্টোরেজ ক্রেডেনশিয়াল পরীক্ষা করা হচ্ছে...');
  await checkCloudinary();

  console.log('⏳ ৪/৫. Firebase ক্লায়েন্ট সাইড কনফিগারেশন যাচাই করা হচ্ছে...');
  checkFirebaseClientConfig();

  console.log('⏳ ৫/৫. সেশন সিকিউরিটি ও এনক্রিপশন কী যাচাই করা হচ্ছে...');
  checkSessionSecret();

  console.log('\n' + '='.repeat(60));
  console.log('📊 সামগ্রিক ফলাফল:');
  console.log('='.repeat(60));
  console.log(JSON.stringify(results, null, 2));
}

run();
