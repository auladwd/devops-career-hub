import { ApplicationStatus, WorkArrangement, EmploymentType, JobSource, PracticeDifficulty, PracticeStatus, Priority, MilestoneStatus, TaskStatus, InterviewType, DocumentCategory } from '../types';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'সংরক্ষিত (Saved)',
  ready: 'আবেদনের জন্য প্রস্তুত (Ready)',
  applied: 'আবেদন করা হয়েছে (Applied)',
  screening: 'রিক্রুটার স্ক্রিনিং (Screening)',
  assessment: 'অনলাইন অ্যাসেসমেন্ট (Assessment)',
  interview_technical: 'টেকনিক্যাল ইন্টারভিউ (Technical)',
  interview_hr: 'এইচআর ইন্টারভিউ (HR)',
  interview_final: 'চূড়ান্ত ইন্টারভিউ (Final)',
  offer: 'অফার প্রাপ্ত (Offer Received)',
  rejected: 'প্রত্যাখ্যাত (Rejected)',
  withdrawn: 'প্রত্যাহার করা (Withdrawn)',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
  saved: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' },
  ready: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  applied: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  screening: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  assessment: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  interview_technical: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  interview_hr: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  interview_final: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  offer: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  rejected: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  withdrawn: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-700' },
};

export const WORK_ARRANGEMENT_LABELS: Record<WorkArrangement, string> = {
  'on-site': 'অন-সাইট (On-site)',
  remote: 'রিমোট (Remote)',
  hybrid: 'হাইব্রিড (Hybrid)',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  'full-time': 'ফুল-টাইম (Full-time)',
  'part-time': 'পার্ট-টাইম (Part-time)',
  contract: 'চুক্তিভিত্তিক (Contract)',
  internship: 'ইন্টার্নশিপ (Internship)',
};

export const JOB_SOURCE_LABELS: Record<JobSource, string> = {
  LinkedIn: 'LinkedIn',
  'Company Website': 'কোম্পানি ওয়েবসাইট',
  BDJobs: 'BDJobs',
  Referral: 'রেফারেল / পরিচিতি',
  Email: 'সরাসরি ইমেইল',
  Other: 'অন্যান্য মাধ্যম',
};

export const DEVOPS_PRACTICE_CATEGORIES = [
  'Linux & Shell Scripting',
  'Git & GitHub',
  'Networking Fundamentals',
  'Python & Automation',
  'Docker & Containerization',
  'Kubernetes (K8s)',
  'CI/CD Pipelines',
  'Jenkins',
  'GitHub Actions',
  'AWS Cloud',
  'Microsoft Azure',
  'Google Cloud Platform (GCP)',
  'Terraform & IaC',
  'Ansible & Config Management',
  'Monitoring & Logging',
  'Prometheus & Grafana',
  'DevSecOps & Security',
  'Nginx & Web Servers',
  'Cloud Database Infrastructure',
  'Real-world DevOps Projects',
  'Interview Preparation',
  'Custom Topics',
] as const;

export const PRACTICE_DIFFICULTY_LABELS: Record<PracticeDifficulty, string> = {
  beginner: 'প্রাথমিক (Beginner)',
  intermediate: 'মধ্যবর্তী (Intermediate)',
  advanced: 'উন্নত (Advanced)',
};

export const PRACTICE_STATUS_LABELS: Record<PracticeStatus, string> = {
  completed: 'সম্পন্ন হয়েছে (Completed)',
  in_progress: 'চলমান রয়েছে (In Progress)',
  needs_revision: 'পুনরাবৃত্তি প্রয়োজন (Needs Revision)',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'কম (Low)',
  medium: 'মাঝারি (Medium)',
  high: 'উচ্চ (High)',
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  not_started: 'শুরু হয়নি (Not Started)',
  in_progress: 'চলমান (In Progress)',
  completed: 'সম্পন্ন (Completed)',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'বাকি আছে (Pending)',
  in_progress: 'চলমান (In Progress)',
  completed: 'সম্পন্ন (Completed)',
};

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  screening: 'প্রাথমিক স্ক্রিনিং (Screening)',
  technical: 'টেকনিক্যাল ইন্টারভিউ (Technical)',
  hr: 'এইচআর আলোচনা (HR)',
  system_design: 'সিস্টেম ডিজাইন / আর্কিটেকচার',
  final: 'চূড়ান্ত আলোচনা (Final)',
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  resume: 'সিভি / রেজ্যুমে (CV/Resume)',
  cover_letter: 'কভার লেটার (Cover Letter)',
  certificate: 'সার্টিফিকেট ও সনদ (Certificate)',
  project: 'প্রজেক্ট ডকুমেন্টেশন (Project Doc)',
  other: 'অন্যান্য ফাইল (Other)',
};

export const DEFAULT_ROADMAP_MILESTONES = [
  {
    order: 1,
    title: 'Linux Fundamentals & Shell Scripting',
    description: 'ফাইল সিস্টেম, পারমিশন, প্রসেস ম্যানেজমেন্ট, Bash স্ক্রিপ্টিং ও অটোমেশন বেসিকস আয়ত্ত করা।',
    skillCategory: 'Linux & Shell Scripting',
    priority: 'high' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: ['https://linuxjourney.com/'],
  },
  {
    order: 2,
    title: 'Git & Version Control Workflow',
    description: 'Git ব্রাঞ্চিং স্ট্র্যাটেজি, Rebase, Merge Conflicts সমাধান এবং GitHub Actions ট্রিগার বোঝা।',
    skillCategory: 'Git & GitHub',
    priority: 'high' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: ['https://git-scm.com/doc'],
  },
  {
    order: 3,
    title: 'Networking & DNS Fundamentals',
    description: 'TCP/IP, OSI মডেল, DNS রেজোলিউশন, সাবনেটিং, ফায়ারওয়াল ও Reverse Proxy আর্কিটেকচার।',
    skillCategory: 'Networking Fundamentals',
    priority: 'medium' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: [],
  },
  {
    order: 4,
    title: 'Python Scripting for DevOps',
    description: 'API ইন্টিগ্রেশন, ক্লাউড SDK (Boto3) ব্যবহার এবং দৈনন্দিন টাস্ক অটোমেশনের জন্য পাইথন ব্যবহার।',
    skillCategory: 'Python & Automation',
    priority: 'medium' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: [],
  },
  {
    order: 5,
    title: 'Docker & Containerization',
    description: 'Multi-stage Dockerfiles তৈরি, ইমেজ অপটিমাইজেশন, ভলিউম ম্যানেজমেন্ট এবং Docker Compose প্র্যাকটিস।',
    skillCategory: 'Docker & Containerization',
    priority: 'high' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: ['https://docs.docker.com/'],
  },
  {
    order: 6,
    title: 'CI/CD Pipelines (GitHub Actions / Jenkins)',
    description: 'অটোমেটেড বিল্ড, টেস্ট, কনটেইনার পুশ এবং ক্লাউডে রোলিং ডেপ্লয়মেন্ট পাইপলাইন কনফিগারেশন।',
    skillCategory: 'CI/CD Pipelines',
    priority: 'high' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: [],
  },
  {
    order: 7,
    title: 'AWS Cloud Core Services',
    description: 'VPC, EC2, S3, IAM রোলস ও পলিসিস, RDS, Route53 ও ECS/EKS এর রিয়েল-ওয়ার্ল্ড ব্যবহার।',
    skillCategory: 'AWS Cloud',
    priority: 'high' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: ['https://aws.amazon.com/training/'],
  },
  {
    order: 8,
    title: 'Infrastructure as Code (Terraform)',
    description: 'Declarative ক্লাউড প্রভিশনিং, State Management, Modules স্ট্রাকচার ও Drift Detection।',
    skillCategory: 'Terraform & IaC',
    priority: 'high' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: ['https://learn.hashicorp.com/terraform'],
  },
  {
    order: 9,
    title: 'Kubernetes (K8s) Cluster & Orchestration',
    description: 'Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, HPA ও Helm চার্ট ডেপ্লয়মেন্ট।',
    skillCategory: 'Kubernetes (K8s)',
    priority: 'high' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: ['https://kubernetes.io/docs/home/'],
  },
  {
    order: 10,
    title: 'Ansible & Configuration Management',
    description: 'Playbooks, Roles, Inventory ম্যানেজমেন্ট ও রিমোট সার্ভার কনফিগারেশন অটোমেশন।',
    skillCategory: 'Ansible & Config Management',
    priority: 'medium' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: [],
  },
  {
    order: 11,
    title: 'Monitoring, Metrics & Logging',
    description: 'Prometheus মেট্রিক্স স্ক্র্যাপ, Grafana ড্যাশবোর্ডস, Alertmanager ও Loki/ELK লগ এগ্রিগেশন।',
    skillCategory: 'Monitoring & Logging',
    priority: 'high' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: [],
  },
  {
    order: 12,
    title: 'DevSecOps & Cloud Security',
    description: 'Trivy কন্টেইনার স্ক্যানিং, SonarQube কোড কোয়ালিটি, Secrets Management (Vault) ও Least Privilege IAM।',
    skillCategory: 'DevSecOps & Security',
    priority: 'medium' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: [],
  },
  {
    order: 13,
    title: 'End-to-End Production DevOps Project',
    description: 'সম্পূর্ণ মাইক্রোসার্ভিস আর্কিটেকচার, IaC দিয়ে প্রভিশনিং, CI/CD এবং K8s ক্লাস্টারে প্রডাকশন পর্যবেক্ষণ।',
    skillCategory: 'Real-world DevOps Projects',
    priority: 'high' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: [],
  },
  {
    order: 14,
    title: 'Resume, Portfolio & Mock Interview Prep',
    description: 'DevOps রেজ্যুমে ফাইনাল করা, গিটহাব ও আর্কিটেকচার ডায়াগ্রাম শোকেস এবং টেকনিক্যাল ইন্টারভিউ রিভিশন।',
    skillCategory: 'Interview Preparation',
    priority: 'high' as Priority,
    status: 'not_started' as MilestoneStatus,
    progressPercent: 0,
    resourceLinks: [],
  },
];

export const STARTER_INTERVIEW_QUESTIONS = [
  {
    question: 'Docker কন্টেইনার এবং ভার্চুয়াল মেশিনের (VM) মূল পার্থক্য কী?',
    answer: 'ভার্চুয়াল মেশিন সম্পূর্ণ গেস্ট ওএস এবং হাইপারভাইজর লেয়ারে রান করে, যা ভারী মেমরি নেয়। পক্ষান্তরে ডকার কন্টেইনার হোস্ট ওএসের কার্নেল শেয়ার করে প্রসেস লেভেল আইসোলেশন নিশ্চিত করে, ফলে এটি অনেক লাইটওয়েট এবং দ্রুত স্টার্ট হয়।',
    category: 'Docker & Containerization',
    difficulty: 'beginner' as PracticeDifficulty,
    confidenceLevel: 4,
    needsRevision: false,
    personalNotes: 'লিনিয়ার এবং ডায়গ্রাম সহ ব্যাখ্যা করার প্রস্তুতি রাখা ভালো।',
  },
  {
    question: 'Kubernetes এ Pod, Deployment এবং Service এর মধ্যে সম্পর্ক কী?',
    answer: 'Pod হলো K8s এর সবচেয়ে ছোট ডিপ্লোয়েবল ইউনিট (এক বা একাধিক কন্টেইনার)। Deployment পডের রেপ্লিকা সংখ্যা, রোলিং আপডেট এবং সেলফ-হিলিং পরিচালনা করে। Service পডগুলোর ডায়নামিক আইপি পরিবর্তনের বিপরীতে একটি স্থিতিশীল নেটওয়ার্ক এন্ডপয়েন্ট ও লোড ব্যালান্সার প্রদান করে।',
    category: 'Kubernetes (K8s)',
    difficulty: 'intermediate' as PracticeDifficulty,
    confidenceLevel: 3,
    needsRevision: false,
    personalNotes: 'NodePort, ClusterIP, LoadBalancer এর পার্থক্য মনে রাখা জরুরি।',
  },
  {
    question: 'CI/CD পাইপলাইনে Continuous Delivery এবং Continuous Deployment এর পার্থক্য কী?',
    answer: 'Continuous Delivery তে কোড টেস্ট ও আর্টফ্যাক্ট বিল্ড হয়ে স্টেজিং পর্যন্ত স্বয়ংক্রিয়ভাবে যায়, তবে প্রডাকশনে রিলিজের জন্য একটি ম্যানুয়াল অ্যাপ্রুভাল বা ট্রিগারের দরকার হয়। Continuous Deployment এ টেস্ট পাস করলেই স্বয়ংক্রিয়ভাবে প্রডাকশনে চলে যায়।',
    category: 'CI/CD Pipelines',
    difficulty: 'beginner' as PracticeDifficulty,
    confidenceLevel: 5,
    needsRevision: false,
    personalNotes: '',
  },
  {
    question: 'Terraform State ফাইল কী এবং Remote State কেন গুরুত্বপূর্ণ?',
    answer: 'Terraform State (.tfstate) ফাইল কনফিগারেশন ফাইল এবং রিয়েল ক্লাউড ইনফ্রাস্ট্রাকচারের ম্যাপিং রেকর্ড রাখে। রিমোট স্টেট (যেমন AWS S3 উইথ DynamoDB লকিং) মাল্টি-টিম কোলাবোরেশনের ক্ষেত্রে স্টেট লকিং ও কনকারেন্ট চেঞ্জ আটকায়।',
    category: 'Terraform & IaC',
    difficulty: 'intermediate' as PracticeDifficulty,
    confidenceLevel: 4,
    needsRevision: false,
    personalNotes: 'S3 bucket versioning এবং DynamoDB LockID মনে রাখতে হবে।',
  },
  {
    question: 'Linux এ ওওএম কিলার (Out-Of-Memory Killer) কী এবং dmesg দিয়ে কীভাবে চেক করবেন?',
    answer: 'যখন সার্ভারের RAM এবং Swap মেমরি শেষ হয়ে যায়, তখন লিনাক্স কার্নেল সিস্টেম ক্র্যাশ ঠেকাতে হাইয়েস্ট মেমরি কনজিউমিং প্রসেসকে কিল করে (oom_score এর ভিত্তিতে)। `dmesg -T | grep -i oom` দিয়ে কিল হওয়া প্রসেসের লগ দেখা যায়।',
    category: 'Linux & Shell Scripting',
    difficulty: 'intermediate' as PracticeDifficulty,
    confidenceLevel: 3,
    needsRevision: true,
    personalNotes: 'সার্ভারে প্রোমেথিয়াস ও Grafana অ্যালার্ট যুক্ত করার উদাহরণ দেওয়া যাবে।',
  },
];
