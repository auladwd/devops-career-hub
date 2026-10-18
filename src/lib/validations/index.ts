import { z } from 'zod';

export const jobApplicationSchema = z.object({
  company: z.string().min(1, 'কোম্পানির নাম আবশ্যক').max(100, 'কোম্পানির নাম ১০০ অক্ষরের মধ্যে হতে হবে'),
  position: z.string().min(1, 'পদের নাম আবশ্যক').max(100, 'পদের নাম ১০০ অক্ষরের মধ্যে হতে হবে'),
  description: z.string().optional().default(''),
  location: z.string().optional().default(''),
  workArrangement: z.enum(['on-site', 'remote', 'hybrid'], {
    error: 'কাজের ধরণ নির্বাচন করুন',
  }),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship'], {
    error: 'চাকরির ধরণ নির্বাচন করুন',
  }),
  experienceLevel: z.string().optional().default(''),
  source: z.enum(['LinkedIn', 'Company Website', 'BDJobs', 'Referral', 'Email', 'Other'], {
    error: 'চাকরির উৎস নির্বাচন করুন',
  }),
  url: z.string().url('সঠিক URL প্রদান করুন').or(z.literal('')).optional().default(''),
  companyUrl: z.string().url('সঠিক কোম্পানি সাইটের URL প্রদান করুন').or(z.literal('')).optional().default(''),
  salaryRange: z.string().optional().default(''),
  currency: z.string().default('BDT'),
  dateDiscovered: z.string().min(1, 'তথ্য পাওয়ার তারিখ দিন'),
  applicationDate: z.string().optional().default(''),
  status: z.enum([
    'saved',
    'ready',
    'applied',
    'screening',
    'assessment',
    'interview_technical',
    'interview_hr',
    'interview_final',
    'offer',
    'rejected',
    'withdrawn',
  ]).default('applied'),
  recruiterName: z.string().optional().default(''),
  recruiterContact: z.string().optional().default(''),
  resumeVersion: z.string().optional().default(''),
  coverLetter: z.string().optional().default(''),
  nextFollowUpDate: z.string().optional().default(''),
  interviewDate: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  tags: z.array(z.string()).default([]),
});

export const practiceSessionSchema = z.object({
  title: z.string().min(1, 'অনুশীলনের শিরোনাম দিন').max(150, 'শিরোনাম ১৫০ অক্ষরের মধ্যে হতে হবে'),
  category: z.string().min(1, 'ক্যাটাগরি নির্বাচন করুন'),
  skill: z.string().min(1, 'নির্দিষ্ট স্কিল বা টুলের নাম দিন'),
  practiceDate: z.string().min(1, 'অনুশীলনের তারিখ আবশ্যক'),
  startTime: z.string().optional().default(''),
  endTime: z.string().optional().default(''),
  durationMinutes: z.coerce.number().min(1, 'অনুশীলনের সময় অন্তত ১ মিনিট হতে হবে').max(1440, 'দৈনিক অনুশীলনের সময় সঠিক দিন'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  confidenceLevel: z.coerce.number().min(1).max(5).default(3),
  status: z.enum(['completed', 'in_progress', 'needs_revision']).default('completed'),
  whatPracticed: z.string().min(1, 'কী কী বিষয় অনুশীলন করেছেন তা উল্লেখ করুন'),
  codeSnippets: z.string().optional().default(''),
  problemsFaced: z.string().optional().default(''),
  solutionsLearned: z.string().optional().default(''),
  resourceLinks: z.array(z.string()).default([]),
  githubUrl: z.string().url('সঠিক GitHub লিংক দিন').or(z.literal('')).optional().default(''),
  projectUrl: z.string().url('সঠিক প্রজেক্ট লিংক দিন').or(z.literal('')).optional().default(''),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional().default(''),
});

export const roadmapMilestoneSchema = z.object({
  title: z.string().min(1, 'মাইলস্টোনের শিরোনাম দিন'),
  description: z.string().min(1, 'মাইলস্টোনের বর্ণনা দিন'),
  skillCategory: z.string().min(1, 'স্কিল ক্যাটাগরি দিন'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  plannedStartDate: z.string().optional().default(''),
  targetCompletionDate: z.string().optional().default(''),
  status: z.enum(['not_started', 'in_progress', 'completed']).default('not_started'),
  progressPercent: z.coerce.number().min(0).max(100).default(0),
  resourceLinks: z.array(z.string()).default([]),
  notes: z.string().optional().default(''),
  order: z.coerce.number().optional().default(0),
});

export const taskItemSchema = z.object({
  title: z.string().min(1, 'কাজের শিরোনাম দিন'),
  description: z.string().optional().default(''),
  category: z.string().default('General'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().min(1, 'শেষ করার তারিখ দিন'),
  dueTime: z.string().optional().default(''),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  relatedType: z.enum(['job_application', 'roadmap_milestone', 'general']).default('general'),
  relatedId: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const interviewQuestionSchema = z.object({
  question: z.string().min(1, 'প্রশ্ন উল্লেখ করুন'),
  answer: z.string().min(1, 'উত্তর উল্লেখ করুন'),
  category: z.string().min(1, 'ক্যাটাগরি দিন'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  confidenceLevel: z.coerce.number().min(1).max(5).default(3),
  needsRevision: z.boolean().default(false),
  personalNotes: z.string().optional().default(''),
});

export const interviewSessionSchema = z.object({
  applicationId: z.string().optional().default(''),
  companyName: z.string().min(1, 'কোম্পানির নাম আবশ্যক'),
  role: z.string().min(1, 'পদের নাম আবশ্যক'),
  interviewDate: z.string().min(1, 'ইন্টারভিউ তারিখ ও সময় দিন'),
  interviewType: z.enum(['screening', 'technical', 'hr', 'system_design', 'final']).default('technical'),
  topicsDiscussed: z.string().optional().default(''),
  questionsAsked: z.string().optional().default(''),
  selfAssessment: z.string().optional().default(''),
  lessonsLearned: z.string().optional().default(''),
  nextActions: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const noteItemSchema = z.object({
  title: z.string().min(1, 'নোটের শিরোনাম দিন'),
  content: z.string().min(1, 'নোটের বিস্তারিত লিখুন'),
  category: z.string().default('DevOps'),
  tags: z.array(z.string()).default([]),
  isPinned: z.boolean().default(false),
});

export const resourceItemSchema = z.object({
  title: z.string().min(1, 'রিসোর্সের নাম দিন'),
  url: z.string().url('সঠিক ওয়েব লিঙ্ক দিন'),
  category: z.string().default('Tutorial'),
  tags: z.array(z.string()).default([]),
  description: z.string().optional().default(''),
  relatedMilestoneId: z.string().optional().default(''),
});

export const documentMetadataSchema = z.object({
  name: z.string().min(1, 'ফাইলের পরিচিতি নাম দিন'),
  originalFilename: z.string(),
  publicId: z.string(),
  secureUrl: z.string().url(),
  format: z.string().optional().default(''),
  bytes: z.number().default(0),
  category: z.enum(['resume', 'cover_letter', 'certificate', 'project', 'other']).default('resume'),
  notes: z.string().optional().default(''),
});

export const userPreferencesSchema = z.object({
  displayName: z.string().min(1, 'নাম আবশ্যক'),
  timezone: z.string().default('Asia/Dhaka'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  dailyPracticeGoalMinutes: z.coerce.number().min(10).max(720).default(60),
  weeklyPracticeGoalHours: z.coerce.number().min(1).max(80).default(10),
  defaultApplicationStatus: z.enum([
    'saved',
    'ready',
    'applied',
    'screening',
    'assessment',
    'interview_technical',
    'interview_hr',
    'interview_final',
    'offer',
    'rejected',
    'withdrawn',
  ]).default('applied'),
  customCategories: z.array(z.string()).optional().default([]),
});
