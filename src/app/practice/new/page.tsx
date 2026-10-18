'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PracticeForm } from '@/components/practice/PracticeForm';
import { Terminal } from 'lucide-react';

function PracticeNewContent() {
  const searchParams = useSearchParams();
  const repeatTitle = searchParams.get('repeatTitle');
  const repeatCategory = searchParams.get('repeatCategory');
  const repeatSkill = searchParams.get('repeatSkill');

  const initialData = repeatTitle
    ? {
        title: `${repeatTitle} (পুনরাবৃত্তি)`,
        category: repeatCategory || undefined,
        skill: repeatSkill || undefined,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <Terminal className="w-7 h-7 text-emerald-600" /> নতুন প্র্যাকটিস সেশন রেকর্ড করুন
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          আজকের ল্যাব সেশন, কমান্ডসমূহ, ফেস করা সমস্যা ও সমাধান লগ করুন
        </p>
      </div>

      <PracticeForm initialData={initialData} />
    </div>
  );
}

export default function NewPracticePage() {
  return (
    <DashboardShell>
      <Suspense fallback={<div className="p-8 text-center text-slate-500">লোড হচ্ছে...</div>}>
        <PracticeNewContent />
      </Suspense>
    </DashboardShell>
  );
}
