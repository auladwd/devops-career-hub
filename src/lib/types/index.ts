export type ApplicationStatus =
  | 'saved'
  | 'ready'
  | 'applied'
  | 'screening'
  | 'assessment'
  | 'interview_technical'
  | 'interview_hr'
  | 'interview_final'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type WorkArrangement = 'on-site' | 'remote' | 'hybrid';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobSource = 'LinkedIn' | 'Company Website' | 'BDJobs' | 'Referral' | 'Email' | 'Other';

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  changedAt: string;
  note?: string;
}

export interface JobApplication {
  _id?: string;
  id?: string;
  userId: string;
  company: string;
  position: string;
  description?: string;
  location?: string;
  workArrangement: WorkArrangement;
  employmentType: EmploymentType;
  experienceLevel?: string;
  source: JobSource;
  url?: string;
  companyUrl?: string;
  salaryRange?: string;
  currency: string;
  dateDiscovered: string;
  applicationDate?: string;
  status: ApplicationStatus;
  recruiterName?: string;
  recruiterContact?: string;
  resumeVersion?: string;
  coverLetter?: string;
  nextFollowUpDate?: string;
  interviewDate?: string;
  notes?: string;
  tags: string[];
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export type PracticeDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type PracticeStatus = 'completed' | 'in_progress' | 'needs_revision';

export interface PracticeSession {
  _id?: string;
  id?: string;
  userId: string;
  title: string;
  category: string;
  skill: string;
  practiceDate: string; // YYYY-MM-DD
  startTime?: string;   // HH:mm
  endTime?: string;     // HH:mm
  durationMinutes: number;
  difficulty: PracticeDifficulty;
  confidenceLevel: number; // 1 to 5
  status: PracticeStatus;
  whatPracticed: string;
  codeSnippets?: string;
  problemsFaced?: string;
  solutionsLearned?: string;
  resourceLinks?: string[];
  githubUrl?: string;
  projectUrl?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high';
export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed';

export interface RoadmapMilestone {
  _id?: string;
  id?: string;
  userId: string;
  order: number;
  title: string;
  description: string;
  skillCategory: string;
  priority: Priority;
  plannedStartDate?: string;
  targetCompletionDate?: string;
  status: MilestoneStatus;
  progressPercent: number; // 0-100
  resourceLinks: string[];
  notes?: string;
  completedDate?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskRelatedType = 'job_application' | 'roadmap_milestone' | 'general';

export interface TaskItem {
  _id?: string;
  id?: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  status: TaskStatus;
  relatedType: TaskRelatedType;
  relatedId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  _id?: string;
  id?: string;
  userId: string;
  question: string;
  answer: string;
  category: string;
  difficulty: PracticeDifficulty;
  confidenceLevel: number; // 1 to 5
  needsRevision: boolean;
  personalNotes?: string;
  isStarter?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InterviewType = 'screening' | 'technical' | 'hr' | 'system_design' | 'final';

export interface InterviewSession {
  _id?: string;
  id?: string;
  userId: string;
  applicationId?: string;
  companyName: string;
  role: string;
  interviewDate: string;
  interviewType: InterviewType;
  topicsDiscussed?: string;
  questionsAsked?: string;
  selfAssessment?: string;
  lessonsLearned?: string;
  nextActions?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteItem {
  _id?: string;
  id?: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceItem {
  _id?: string;
  id?: string;
  userId: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  description?: string;
  relatedMilestoneId?: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentCategory = 'resume' | 'cover_letter' | 'certificate' | 'project' | 'other';

export interface DocumentItem {
  _id?: string;
  id?: string;
  userId: string;
  name: string;
  originalFilename: string;
  publicId: string;
  secureUrl: string;
  format?: string;
  bytes: number;
  category: DocumentCategory;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  _id?: string;
  id?: string;
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  dailyPracticeGoalMinutes: number;
  weeklyPracticeGoalHours: number;
  defaultApplicationStatus: ApplicationStatus;
  customCategories?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalApplications: number;
  applicationsThisWeek: number;
  applicationsThisMonth: number;
  inProgressApplications: number;
  pendingAssessments: number;
  upcomingInterviewsCount: number;
  offersReceived: number;
  rejections: number;
  followUpsDueCount: number;

  totalPracticeSessions: number;
  totalPracticeHours: number;
  practiceHoursThisWeek: number;
  tasksCompleted: number;
  currentStreakDays: number;
  weeklyGoalCompletionPercent: number;
  roadmapCompletionPercent: number;

  applicationStatusDistribution: { status: ApplicationStatus; label: string; count: number }[];
  weeklyPracticeHoursTrend: { day: string; date: string; hours: number }[];
  skillProgressDistribution: { skill: string; hours: number; sessions: number }[];
  recentApplications: JobApplication[];
  recentPracticeSessions: PracticeSession[];
  todayTasks: TaskItem[];
  upcomingInterviews: InterviewSession[];
}

export interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}
